"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache";
import {
  bool,
  failed,
  int,
  lines,
  publish,
  requiredText,
  SAVED,
  text,
  url,
  type ActionState,
} from "./shared";

const SPONSOR_PATHS = ["/", "/sponsors", "/sponsorship"];

// ------------------------------------------------------------ levels

export async function saveLevel(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const name = requiredText(form, "name");
  const priceLabel = requiredText(form, "price_label");
  if (!name) return failed("A level needs a name.");
  if (!priceLabel) return failed("A level needs a price to show, e.g. $1,000+.");

  const row = {
    name,
    price_label: priceLabel,
    price_amount: int(form, "price_amount"),
    max_available: int(form, "max_available"),
    benefits: lines(form, "benefits"),
    show_logo: bool(form, "show_logo"),
    on_poster: bool(form, "on_poster"),
  };

  const id = text(form, "id");

  if (id) {
    const { error } = await supabase.from("sponsorship_levels").update(row).eq("id", id);
    if (error) return failed(error.message);
  } else {
    const { data } = await supabase
      .from("sponsorship_levels")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const next = ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;

    const { error } = await supabase
      .from("sponsorship_levels")
      .insert({ ...row, sort_order: next });
    if (error) return failed(error.message);
  }

  publish([TAGS.levels], SPONSOR_PATHS);
  return SAVED;
}

/**
 * Levels are kept rather than deleted when sponsors are attached to them —
 * deleting would blank those sponsors' level on the public page.
 */
export async function deleteLevel(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  if (!id) return failed("Which level?");

  const { count } = await supabase
    .from("sponsors")
    .select("id", { count: "exact", head: true })
    .eq("level_id", id);

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("sponsorship_levels")
      .update({ active: false })
      .eq("id", id);
    if (error) return failed(error.message);

    publish([TAGS.levels], SPONSOR_PATHS);
    return {
      status: "success",
      message: `Hidden from the site. ${count} sponsor${count === 1 ? " is" : "s are"} still on this level, so the level itself was kept.`,
    };
  }

  const { error } = await supabase.from("sponsorship_levels").delete().eq("id", id);
  if (error) return failed(error.message);

  publish([TAGS.levels], SPONSOR_PATHS);
  return { status: "success", message: "Level removed — live on the site" };
}

/** Swap a level with its neighbour. The first level is the Presenting card. */
export async function moveLevel(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  const direction = text(form, "direction");
  if (!id || (direction !== "up" && direction !== "down")) {
    return failed("Couldn't move that level.");
  }

  const { data: levels } = await supabase
    .from("sponsorship_levels")
    .select("id, sort_order")
    .eq("active", true)
    .order("sort_order");

  const ordered = levels ?? [];
  const index = ordered.findIndex((l) => l.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ordered.length) return SAVED;

  // Write positions back from scratch, so a gap or a duplicate in sort_order
  // can't make the order jump around.
  const reordered = [...ordered];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  for (const [position, level] of reordered.entries()) {
    const { error } = await supabase
      .from("sponsorship_levels")
      .update({ sort_order: position })
      .eq("id", level.id);
    if (error) return failed(error.message);
  }

  publish([TAGS.levels], SPONSOR_PATHS);
  return SAVED;
}

// ------------------------------------------------------------ sponsors

export async function saveSponsor(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const name = requiredText(form, "name");
  if (!name) return failed("A sponsor needs a name.");

  const year = int(form, "year");
  if (!year) return failed("Which year is this sponsorship for?");

  const status = text(form, "status");
  if (status !== "Pledged" && status !== "Paid") {
    return failed("Status is either Pledged or Paid.");
  }

  const row = {
    year,
    name,
    level_id: text(form, "level_id"),
    status,
    logo_path: text(form, "logo_path"),
    website: url(form, "website"),
    in_kind_note: text(form, "in_kind_note"),
  };

  const id = text(form, "id");

  if (id) {
    const { error } = await supabase.from("sponsors").update(row).eq("id", id);
    if (error) return failed(error.message);
  } else {
    const { data } = await supabase
      .from("sponsors")
      .select("sort_order")
      .eq("year", year)
      .order("sort_order", { ascending: false })
      .limit(1);
    const next = ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;

    const { error } = await supabase.from("sponsors").insert({ ...row, sort_order: next });
    if (error) return failed(error.message);
  }

  publish([TAGS.sponsors], SPONSOR_PATHS);
  return SAVED;
}

export async function deleteSponsor(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  if (!id) return failed("Which sponsor?");

  // Clear the homepage lockup first, or the delete trips the foreign key.
  const { data: settings } = await supabase
    .from("settings")
    .select("presenting_sponsor_id")
    .eq("id", 1)
    .single();

  if (settings?.presenting_sponsor_id === id) {
    await supabase
      .from("settings")
      .update({ presenting_sponsor_id: null, presenting_enabled: false })
      .eq("id", 1);
  }

  const { error } = await supabase.from("sponsors").delete().eq("id", id);
  if (error) return failed(error.message);

  publish([TAGS.sponsors, TAGS.settings], SPONSOR_PATHS);
  return { status: "success", message: "Sponsor removed — live on the site" };
}

/**
 * "Copy last year's sponsors as Pledged" — the usual way a new year starts.
 * Sponsors already listed for the new year are skipped, so it's safe to press
 * more than once.
 */
export async function copyLastYearSponsors(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const year = int(form, "year");
  if (!year) return failed("Which year are we copying into?");

  const [{ data: previous }, { data: existing }] = await Promise.all([
    supabase.from("sponsors").select("*").eq("year", year - 1).order("sort_order"),
    supabase.from("sponsors").select("name").eq("year", year),
  ]);

  const already = new Set((existing ?? []).map((s) => (s.name as string).toLowerCase()));
  const toAdd = (previous ?? [])
    .filter((s) => !already.has((s.name as string).toLowerCase()))
    .map((s, i) => ({
      year,
      name: s.name as string,
      level_id: s.level_id as string | null,
      legacy_level: s.legacy_level as string | null,
      status: "Pledged" as const,
      logo_path: s.logo_path as string | null,
      website: s.website as string | null,
      in_kind_note: s.in_kind_note as string | null,
      sort_order: i,
    }));

  if (toAdd.length === 0) {
    return {
      status: "success",
      message: `Every ${year - 1} sponsor is already on the ${year} list.`,
    };
  }

  const { error } = await supabase.from("sponsors").insert(toAdd);
  if (error) return failed(error.message);

  publish([TAGS.sponsors], SPONSOR_PATHS);
  return {
    status: "success",
    message: `Added ${toAdd.length} sponsor${toAdd.length === 1 ? "" : "s"} from ${year - 1} as Pledged — live on the site`,
  };
}

/** The printable sponsorship form linked from /sponsorship. */
export async function saveSponsorshipForm(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .update({ sponsorship_form_path: text(form, "sponsorship_form_path") })
    .eq("id", 1);

  if (error) return failed(error.message);

  publish([TAGS.settings], ["/sponsorship"]);
  return SAVED;
}
