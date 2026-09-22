"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import {
  APPLICATION_PHOTO_FOLDER,
  BOOTH_TYPES,
  MAX_CARVER_PHOTOS,
  MIN_CARVER_PHOTOS,
  QUICK_CARVE_COMFORT,
  SHIRT_SIZES,
  carverSellingFee,
  vendorFee,
} from "@/lib/applications";
import type { ActionState } from "@/lib/actions/state";
import type { BoothType, QuickCarveComfort, Settings, ShirtSize } from "@/lib/types";

// ActionState's constants live in @/lib/actions/state: a "use server" file may
// only export async functions, so declaring them here would break the forms at
// runtime. Same reason the helpers below are plain functions, not exports.

/**
 * Applications are written with the service role, exactly like the newsletter:
 * `carver_applications` and `vendor_applications` have no public insert policy,
 * because they hold home addresses and nobody should be able to read them back.
 * Everything a stranger submits therefore gets validated here first.
 */

// ------------------------------------------------------------------ limits

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

/**
 * Best-effort per-IP limit, per the newsletter action's reasoning: an in-memory
 * map only holds for one serverless instance, which is enough to stop a form
 * being hammered from one browser. An application is a slow, deliberate thing —
 * four an hour is generous for a household sharing an address.
 */
function rateLimited(ip: string, max = MAX_PER_WINDOW): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > max;
}

async function clientIp(): Promise<string> {
  const headerList = await headers();
  return (headerList.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
}

// ------------------------------------------------------------- validation

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function field(form: FormData, key: string, max = 200): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optional(form: FormData, key: string, max = 200): string | null {
  return field(form, key, max) || null;
}

function checked(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "yes";
}

function fail(message: string): ActionState {
  return { status: "error", message };
}

/** An external link we're willing to store. Only http(s), like the admin's. */
function link(form: FormData, key: string): string | null {
  const raw = field(form, key, 300);
  if (!raw) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * The contact block both forms share. Returns an error message, or the values.
 * `phone` is checked for digits rather than a shape — the Chamber gets numbers
 * from Canada and the U.K. too.
 */
function contactDetails(form: FormData):
  | { error: string }
  | {
      first_name: string;
      last_name: string;
      street_address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
    } {
  const first_name = field(form, "first_name", 80);
  const last_name = field(form, "last_name", 80);
  const street_address = field(form, "street_address", 200);
  const city = field(form, "city", 100);
  const state = field(form, "state", 60);
  const zip = field(form, "zip", 20);
  const phone = field(form, "phone", 40);
  const email = field(form, "email", 254).toLowerCase();

  if (!first_name || !last_name) return { error: "Please give your first and last name." };
  if (!street_address || !city || !state || !zip) {
    return { error: "Please give a full mailing address — the Chamber mails out packets." };
  }
  if ((phone.match(/\d/g) ?? []).length < 7) {
    return { error: "Please give a phone number we can reach you on." };
  }
  if (!email || !EMAIL.test(email)) {
    return { error: "That doesn't look like an email address." };
  }

  return { first_name, last_name, street_address, city, state, zip, phone, email };
}

/** The settings the forms depend on, read fresh so a closed form stays closed. */
async function loadSettings(): Promise<Settings | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
  return (data as Settings | null) ?? null;
}

const NO_SERVICE_KEY =
  "Applications aren't switched on yet. Please call the Chamber at 541-271-3495 and we'll take yours over the phone.";

// -------------------------------------------------------------- uploads

/**
 * Hand the browser a one-shot signed URL so an applicant can put a photo
 * straight into Storage.
 *
 * The bucket only lets admins write, and deliberately so — but an applicant
 * isn't an admin and still has to get photos to us. Signing here keeps that
 * gate: the path is ours, the token is single-use, and the upload never passes
 * through this server, so it isn't bound by the 4.5 MB request-body ceiling a
 * server action would impose on a phone photo.
 */
export async function signApplicationPhotoUpload(
  extension: string,
): Promise<{ path: string; token: string } | { error: string }> {
  const allowed = ["jpg", "jpeg", "png", "webp", "avif", "heic"];
  const ext = extension.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  if (!allowed.includes(ext)) {
    return { error: "Please upload a JPG, PNG, WEBP or HEIC photo." };
  }

  // A signature is cheap, but not free — an upload is still a write to our
  // storage. Ten an hour covers six photos plus a couple of retries.
  if (rateLimited(`upload:${await clientIp()}`, MAX_CARVER_PHOTOS + 4)) {
    return { error: "Too many uploads just now. Give it a minute and try again." };
  }

  const supabase = createServiceClient();
  if (!supabase) return { error: NO_SERVICE_KEY };

  const path = `${APPLICATION_PHOTO_FOLDER}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("odccc-media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("Application photo upload could not be signed:", error?.message);
    return { error: "We couldn't start that upload. Please try again." };
  }

  return { path: data.path, token: data.token };
}

/**
 * Only accept photo paths this server handed out. A hidden input is the
 * applicant's to edit, so without this check an application could name any
 * object in the bucket — including a sponsor's logo — as its own.
 */
function photoPaths(form: FormData): string[] {
  const pattern = new RegExp(
    `^${APPLICATION_PHOTO_FOLDER}/[0-9a-f-]{36}\\.[a-z0-9]{1,5}$`,
  );
  return (form.getAll("photo_paths") as string[])
    .map((p) => String(p).trim())
    .filter((p) => pattern.test(p))
    .slice(0, MAX_CARVER_PHOTOS);
}

// ------------------------------------------------------- carver application

export async function applyAsCarver(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  // Honeypot, as on the newsletter: look successful so a bot doesn't retry.
  if (field(form, "company")) {
    return { status: "success", message: "Thank you — your application is in." };
  }

  const settings = await loadSettings();
  if (!settings) return fail(NO_SERVICE_KEY);
  if (!settings.carver_applications_open) {
    return fail("Carver applications aren't open yet. Sign up for the newsletter and we'll tell you the day they are.");
  }

  const contact = contactDetails(form);
  if ("error" in contact) return fail(contact.error);

  const division = field(form, "division", 20);
  if (division !== "Pro" && division !== "Semi-Pro") {
    return fail("Choose the division you want to compete in.");
  }

  const shirt = field(form, "shirt_size", 10) as ShirtSize;
  if (!SHIRT_SIZES.includes(shirt)) return fail("Pick a t-shirt size.");

  const comfort = field(form, "quick_carve_comfort", 20) as QuickCarveComfort;
  if (!QUICK_CARVE_COMFORT.includes(comfort)) {
    return fail("Tell us how you feel about Quick Carves.");
  }

  const experience = field(form, "experience", 5_000);
  if (experience.length < 20) {
    return fail("Please tell us a little about your carving experience.");
  }

  const photos = photoPaths(form);
  if (photos.length < MIN_CARVER_PHOTOS) {
    return fail(`Please add at least ${MIN_CARVER_PHOTOS} photos of your work.`);
  }

  const wantsSelling = checked(form, "wants_selling_space");
  const sellingSpaces = wantsSelling
    ? Math.min(10, Math.max(1, Number.parseInt(field(form, "selling_spaces", 4), 10) || 1))
    : null;

  if (rateLimited(await clientIp())) {
    return fail("That's several applications in a short time. Give it a few minutes.");
  }

  const supabase = createServiceClient();
  if (!supabase) return fail(NO_SERVICE_KEY);

  const { error } = await supabase.from("carver_applications").insert({
    year: settings.event_year,
    ...contact,
    text_ok: checked(form, "text_ok"),
    division,
    shirt_size: shirt,
    quick_carve_comfort: comfort,
    experience,
    bio: optional(form, "bio", 5_000),
    public_contact: optional(form, "public_contact", 300),
    photo_paths: photos,
    wants_selling_space: wantsSelling,
    selling_business_name: wantsSelling ? optional(form, "selling_business_name", 150) : null,
    selling_spaces: sellingSpaces,
    selling_other_items: wantsSelling ? optional(form, "selling_other_items", 500) : null,
    selling_fee_total: wantsSelling
      ? carverSellingFee(settings.carver_selling_space_fee, sellingSpaces ?? 0)
      : null,
  });

  if (error) {
    console.error("Carver application failed:", error.message);
    return fail("Something went wrong saving your application. Please try again.");
  }

  return { status: "success", message: "Thank you — your application is in." };
}

// ------------------------------------------------------- vendor application

export async function applyAsVendor(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (field(form, "company")) {
    return { status: "success", message: "Thank you — your application is in." };
  }

  const settings = await loadSettings();
  if (!settings) return fail(NO_SERVICE_KEY);
  if (!settings.vendor_applications_open) {
    return fail("Vendor applications aren't open yet. Sign up for the newsletter and we'll tell you the day they are.");
  }

  const business_name = field(form, "business_name", 150);
  if (!business_name) return fail("Please give your business or organization name.");

  const contact = contactDetails(form);
  if ("error" in contact) return fail(contact.error);

  const booth_type = field(form, "booth_type", 20) as BoothType;
  if (!BOOTH_TYPES.includes(booth_type)) return fail("Choose a booth type.");

  const items_for_sale = field(form, "items_for_sale", 2_000);
  if (items_for_sale.length < 5) {
    return fail("List what you'll be selling — only the items listed are allowed at the booth.");
  }

  const spaces = Math.min(20, Math.max(1, Number.parseInt(field(form, "spaces", 4), 10) || 1));
  const chamber_member = checked(form, "chamber_member");
  // Electricity is a food-vendor line on the Chamber's schedule; a craft booth
  // ticking the box must not be billed for it.
  const electrical = booth_type === "Food" && checked(form, "electrical");

  const workers_comp = field(form, "workers_comp", 20);
  if (workers_comp !== "no-employees" && workers_comp !== "has-employees") {
    return fail("The workers' compensation certificate is required by Douglas County — please choose one.");
  }

  if (!checked(form, "agrees_terms") || !checked(form, "agrees_code_of_conduct") || !checked(form, "agrees_waiver")) {
    return fail("Please agree to the terms, the code of conduct and the waiver.");
  }

  const signature_name = field(form, "signature_name", 120);
  if (signature_name.length < 3) {
    return fail("Type your full name to sign the application.");
  }

  if (rateLimited(await clientIp())) {
    return fail("That's several applications in a short time. Give it a few minutes.");
  }

  const supabase = createServiceClient();
  if (!supabase) return fail(NO_SERVICE_KEY);

  // Recomputed here rather than trusted from the form: the total the applicant
  // saw is a convenience, and the Chamber invoices from this number.
  const fee = vendorFee(settings, { boothType: booth_type, chamberMember: chamber_member, spaces, electrical });

  const { error } = await supabase.from("vendor_applications").insert({
    year: settings.event_year,
    business_name,
    ...contact,
    fax: optional(form, "fax", 40),
    website: link(form, "website"),
    booth_type,
    chamber_member,
    items_for_sale,
    electrical,
    electrical_needs: electrical ? optional(form, "electrical_needs", 500) : null,
    spaces,
    fee_total: fee.total,
    near_vendor: optional(form, "near_vendor", 150),
    workers_comp,
    agrees_terms: true,
    agrees_code_of_conduct: true,
    agrees_waiver: true,
    signature_name,
  });

  if (error) {
    console.error("Vendor application failed:", error.message);
    return fail("Something went wrong saving your application. Please try again.");
  }

  return { status: "success", message: "Thank you — your application is in." };
}
