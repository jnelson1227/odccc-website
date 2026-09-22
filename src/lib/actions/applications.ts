"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES, hometownFrom } from "@/lib/applications";
import type {
  ApplicationStatus,
  Carver,
  CarverApplication,
  CarverGalleryItem,
} from "@/lib/types";
import {
  bool,
  failed,
  int,
  publish,
  SAVED,
  slugify,
  text,
  uniqueSlug,
  type ActionState,
} from "./shared";

/**
 * The committee's side of an application: move it through review, keep notes on
 * it, and eventually clear it out.
 *
 * Nothing here touches a cache tag — no public page reads applications — so a
 * save only revalidates the admin screen it came from.
 */

const ADMIN_PATH = "/admin/applications";

/** Only these two tables, and only ever named from this list. */
type Kind = "carver" | "vendor";

function tableFor(kind: string): "carver_applications" | "vendor_applications" | null {
  if (kind === "carver") return "carver_applications";
  if (kind === "vendor") return "vendor_applications";
  return null;
}

export async function setApplicationStatus(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const table = tableFor(String(form.get("kind") ?? ""));
  if (!table) return failed("Unknown application type.");

  const id = text(form, "id");
  if (!id) return failed("Missing application.");

  const status = text(form, "status") as ApplicationStatus | null;
  if (!status || !APPLICATION_STATUSES.includes(status)) {
    return failed("Pick a status.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) return failed(error.message);

  revalidatePath(ADMIN_PATH);
  return { status: "success", message: `Marked ${status.toLowerCase()}` };
}

export async function saveApplicationNotes(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const table = tableFor(String(form.get("kind") ?? ""));
  if (!table) return failed("Unknown application type.");

  const id = text(form, "id");
  if (!id) return failed("Missing application.");

  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({ admin_notes: text(form, "admin_notes") })
    .eq("id", id);
  if (error) return failed(error.message);

  revalidatePath(ADMIN_PATH);
  return SAVED;
}

/**
 * Accept a carver application: confirm them for the year and carry their
 * answers onto a carver profile — an existing one the committee matched, or a
 * new one.
 *
 * Photos are *copied* into the carver's own folder rather than referenced
 * where the applicant uploaded them, so deleting the application afterwards
 * can't knock a picture off a live page. Every photo carried over needs alt
 * text, which the admin writes here — the application never asked for it.
 */
export async function acceptCarverApplication(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  if (!id) return failed("Missing application.");

  const { data: appRow, error: appError } = await supabase
    .from("carver_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (appError) return failed(appError.message);
  const app = appRow as CarverApplication | null;
  if (!app) return failed("That application is gone.");

  const { data: settings } = await supabase
    .from("settings")
    .select("event_year")
    .eq("id", 1)
    .single();
  const year = (settings?.event_year as number | undefined) ?? app.year;

  // Which carver this becomes. "" means make a new one.
  const carverId = text(form, "carver_id");
  let existing: Carver | null = null;
  if (carverId) {
    const { data } = await supabase.from("carvers").select("*").eq("id", carverId).maybeSingle();
    existing = (data as Carver | null) ?? null;
    if (!existing) return failed("That carver no longer exists — pick another or create a new one.");
  }

  const name = `${app.first_name} ${app.last_name}`.trim();
  const slug = existing ? existing.slug : await uniqueSlug(supabase, slugify(name));

  // Photos first, so a failed copy stops everything before the profile changes.
  const portraitIndex = int(form, "portrait_index");
  let portrait: CarverGalleryItem | null = null;
  const gallery: CarverGalleryItem[] = [];

  for (const [i, source] of app.photo_paths.entries()) {
    if (!bool(form, `photo_include_${i}`)) continue;
    const alt = text(form, `photo_alt_${i}`);
    if (!alt) return failed("Every photo you carry over needs alt text describing what it shows.");

    const extension = source.split(".").pop() ?? "jpg";
    const destination = `carvers/${slug}/${crypto.randomUUID()}.${extension}`;
    const { error: copyError } = await supabase.storage
      .from("odccc-media")
      .copy(source, destination);
    if (copyError) return failed(`Couldn't copy photo ${i + 1}: ${copyError.message}`);

    if (portraitIndex === i) portrait = { path: destination, alt };
    else gallery.push({ path: destination, alt });
  }

  // What to write. A new profile takes everything; an existing one only what
  // the committee ticked, so a returning carver's polished bio isn't replaced
  // by a two-line application note without someone choosing that.
  const take = (key: string) => !existing || bool(form, `update_${key}`);
  const row: Record<string, unknown> = {};

  if (!existing) row.name = name;
  if (take("division")) row.division = app.division;
  if (take("hometown") && hometownFrom(app)) row.hometown = hometownFrom(app);
  if (take("bio") && app.bio) row.bio = app.bio;
  for (const key of ["website", "facebook", "instagram", "tiktok"] as const) {
    if (take(key) && app[key]) row[key] = app[key];
  }
  if (portrait) {
    row.portrait_path = portrait.path;
    row.portrait_alt = portrait.alt;
  }
  if (gallery.length > 0) {
    row.gallery = [...(existing?.gallery ?? []), ...gallery];
  }

  let finalId = existing?.id ?? null;
  if (existing) {
    if (Object.keys(row).length > 0) {
      const { error } = await supabase.from("carvers").update(row).eq("id", existing.id);
      if (error) return failed(error.message);
    }
  } else {
    const { data, error } = await supabase
      .from("carvers")
      .insert({ ...row, slug, country: "USA" })
      .select("id")
      .single();
    if (error) return failed(error.message);
    finalId = data.id as string;
  }
  if (!finalId) return failed("Couldn't save the carver.");

  const { error: yearError } = await supabase
    .from("carver_years")
    .upsert({ carver_id: finalId, year, status: "Confirmed" }, { onConflict: "carver_id,year" });
  if (yearError) return failed(yearError.message);

  const { error: markError } = await supabase
    .from("carver_applications")
    .update({ status: "Accepted", carver_id: finalId, accepted_at: new Date().toISOString() })
    .eq("id", id);
  if (markError) return failed(markError.message);

  publish([TAGS.carvers], ["/", "/carvers", `/carvers/${slug}`]);
  revalidatePath(ADMIN_PATH);
  return {
    status: "success",
    message: `Accepted — ${name} is confirmed for ${year} and live at /carvers/${slug}`,
  };
}

/**
 * Delete an application. The uploaded photos go with it — leaving them behind
 * would keep a stranger's files in the bucket with nothing pointing at them,
 * and the Chamber has no way to find them again.
 */
export async function deleteApplication(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const kind = String(form.get("kind") ?? "") as Kind;
  const table = tableFor(kind);
  if (!table) return failed("Unknown application type.");

  const id = text(form, "id");
  if (!id) return failed("Missing application.");

  const supabase = await createClient();

  if (kind === "carver") {
    const { data } = await supabase
      .from("carver_applications")
      .select("photo_paths")
      .eq("id", id)
      .maybeSingle();

    const paths = (data?.photo_paths ?? []) as string[];
    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage.from("odccc-media").remove(paths);
      // Worth knowing about, but not worth blocking the delete the admin asked
      // for — an orphaned object is a smaller problem than a row that won't go.
      if (removeError) {
        console.error("Could not remove application photos:", removeError.message);
      }
    }
  }

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return failed(error.message);

  revalidatePath(ADMIN_PATH);
  return { status: "success", message: "Application deleted" };
}
