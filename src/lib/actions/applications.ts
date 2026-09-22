"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES } from "@/lib/applications";
import type { ApplicationStatus } from "@/lib/types";
import { failed, SAVED, text, type ActionState } from "./shared";

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
