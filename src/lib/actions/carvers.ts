"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache";
import {
  bool,
  failed,
  int,
  publish,
  requiredText,
  SAVED,
  slugify,
  text,
  url,
  type ActionState,
} from "./shared";
import type { CarverStatus } from "@/lib/types";

const STATUSES: CarverStatus[] = ["Confirmed", "Invited", "Not attending"];
const CARVER_PATHS = ["/", "/carvers"];

export async function saveCarver(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  const name = requiredText(form, "name");
  if (!name) return failed("A carver needs a name.");

  const division = text(form, "division");
  if (division !== "Pro" && division !== "Semi-Pro") {
    return failed("Pick Pro or Semi-Pro.");
  }

  const cardLine = text(form, "card_line");
  if (cardLine && cardLine.length > 80) {
    return failed("The card line has to be 80 characters or fewer.");
  }

  const photoPath = text(form, "photo_path");
  const photoAlt = text(form, "photo_alt");
  if (photoPath && !photoAlt) {
    return failed("Every photo needs alt text describing what it shows.");
  }

  const year = int(form, "year");
  const status = text(form, "status");
  if (year && status && !STATUSES.includes(status as CarverStatus)) {
    return failed("That isn't a status we recognise.");
  }

  const row = {
    name,
    hometown: text(form, "hometown"),
    country: text(form, "country") ?? "USA",
    division,
    studio: text(form, "studio"),
    website: url(form, "website"),
    facebook: text(form, "facebook"),
    instagram: text(form, "instagram"),
    tiktok: text(form, "tiktok"),
    card_line: cardLine,
    bio: text(form, "bio"),
    honor_badge: text(form, "honor_badge"),
    photo_path: photoPath,
    // Alt text without a photo is meaningless, so drop it with the photo.
    photo_alt: photoPath ? photoAlt : null,
  };

  let carverId = id;

  if (id) {
    const { error } = await supabase.from("carvers").update(row).eq("id", id);
    if (error) return failed(error.message);
  } else {
    const slug = await uniqueSlug(supabase, slugify(name));
    const { data, error } = await supabase
      .from("carvers")
      .insert({ ...row, slug })
      .select("id")
      .single();
    if (error) return failed(error.message);
    carverId = data.id as string;
  }

  if (carverId && year && status) {
    const { error } = await supabase
      .from("carver_years")
      .upsert({ carver_id: carverId, year, status }, { onConflict: "carver_id,year" });
    if (error) return failed(error.message);
  }

  if (carverId) {
    const featureError = await setFeatured(supabase, carverId, bool(form, "featured"));
    if (featureError) return failed(featureError);
  }

  publish([TAGS.carvers, TAGS.settings], CARVER_PATHS);
  return SAVED;
}

/** Set just the year status from the table, without opening the edit panel. */
export async function setCarverStatus(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const carverId = text(form, "carver_id");
  const year = int(form, "year");
  const status = text(form, "status");

  if (!carverId || !year || !status || !STATUSES.includes(status as CarverStatus)) {
    return failed("Couldn't update that carver's status.");
  }

  const { error } = await supabase
    .from("carver_years")
    .upsert({ carver_id: carverId, year, status }, { onConflict: "carver_id,year" });
  if (error) return failed(error.message);

  publish([TAGS.carvers], CARVER_PATHS);
  return SAVED;
}

/**
 * "Copy last year's lineup as Invited" — the usual way a new year starts.
 * Carvers who already have a status for the new year are left alone, so
 * pressing it twice can't undo work someone has already done.
 */
export async function copyLastYearLineup(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const year = int(form, "year");
  if (!year) return failed("Which year are we copying into?");

  const [{ data: previous }, { data: existing }] = await Promise.all([
    supabase
      .from("carver_years")
      .select("carver_id")
      .eq("year", year - 1)
      .in("status", ["Confirmed", "Invited"]),
    supabase.from("carver_years").select("carver_id").eq("year", year),
  ]);

  const already = new Set((existing ?? []).map((r) => r.carver_id as string));
  const toAdd = (previous ?? [])
    .map((r) => r.carver_id as string)
    .filter((carverId) => !already.has(carverId))
    .map((carverId) => ({ carver_id: carverId, year, status: "Invited" as const }));

  if (toAdd.length === 0) {
    return { status: "success", message: `Every ${year - 1} carver is already on the ${year} list.` };
  }

  const { error } = await supabase.from("carver_years").insert(toAdd);
  if (error) return failed(error.message);

  publish([TAGS.carvers], CARVER_PATHS);
  return {
    status: "success",
    message: `Invited ${toAdd.length} carver${toAdd.length === 1 ? "" : "s"} from ${year - 1} — live on the site`,
  };
}

/** The homepage list is stored on `settings`, so featuring happens there. */
async function setFeatured(
  supabase: Awaited<ReturnType<typeof createClient>>,
  carverId: string,
  featured: boolean,
): Promise<string | null> {
  const { data } = await supabase.from("settings").select("featured_carver_ids").eq("id", 1).single();
  const current: string[] = data?.featured_carver_ids ?? [];
  const has = current.includes(carverId);

  if (featured === has) return null;
  if (featured && current.length >= 6) {
    return "The homepage shows six carvers. Remove one under Event & homepage first.";
  }

  const next = featured ? [...current, carverId] : current.filter((id) => id !== carverId);
  const { error } = await supabase.from("settings").update({ featured_carver_ids: next }).eq("id", 1);
  return error ? error.message : null;
}

/** Keep slugs unique — two carvers can share a name. */
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
): Promise<string> {
  const root = base || "carver";
  const { data } = await supabase.from("carvers").select("slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).map((r) => r.slug as string));

  if (!taken.has(root)) return root;
  for (let n = 2; n < 100; n++) {
    if (!taken.has(`${root}-${n}`)) return `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}
