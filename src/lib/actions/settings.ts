"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ALL_TAGS, TAGS } from "@/lib/cache";
import {
  bool,
  failed,
  int,
  publish,
  SAVED,
  text,
  url,
  type ActionState,
} from "./shared";

const FEE_KEYS = [
  "carver_selling_space_fee",
  "vendor_fee_food",
  "vendor_fee_food_member",
  "vendor_fee_other",
  "vendor_fee_other_member",
  "vendor_fee_additional_space",
  "vendor_fee_electrical",
] as const;

const PUBLIC_PATHS = [
  "/",
  "/apply/carver",
  "/apply/vendor",
  "/carvers",
  "/schedule",
  "/visit",
  "/sponsors",
  "/sponsorship",
  "/our-story",
];

export async function saveSettings(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const year = int(form, "event_year");
  if (!year || year < 2000 || year > 2100) {
    return failed("Pick a championship year.");
  }

  // The override only applies when the box is ticked AND both dates are given;
  // a half-filled override would silently fall back and confuse everyone.
  const overriding = bool(form, "override_dates");
  const start = overriding ? text(form, "date_override_start") : null;
  const end = overriding ? text(form, "date_override_end") : null;
  if (overriding && (!start || !end)) {
    return failed("Overriding the dates needs both a start and an end date.");
  }
  if (start && end && start > end) {
    return failed("The start date has to come before the end date.");
  }

  const wash = Number(text(form, "hero_wash") ?? "0.8");
  if (!Number.isFinite(wash) || wash < 0.5 || wash > 0.95) {
    return failed("The background wash has to be between 0.5 and 0.95.");
  }

  const mode = text(form, "carvers_page_mode");
  if (mode !== "current" && mode !== "previous") {
    return failed("Pick how the Carvers page should read.");
  }

  const presentingEnabled = bool(form, "presenting_enabled");
  const presentingId = text(form, "presenting_sponsor_id");
  if (presentingEnabled && !presentingId) {
    return failed("Choose which sponsor is presenting before switching it on.");
  }

  const featured = (form.getAll("featured_carver_ids") as string[]).filter(Boolean);
  if (featured.length > 6) {
    return failed("The homepage shows six carvers — pick six or fewer.");
  }

  const ticket = text(form, "ticket_url");
  if (ticket && !url(form, "ticket_url")) {
    return failed("The ticket link needs to start with http:// or https://");
  }

  // Fees are whole dollars; a blank or nonsense entry keeps the current value
  // rather than silently charging nothing.
  const fees: Record<string, number> = {};
  for (const key of FEE_KEYS) {
    const value = int(form, key);
    if (value === null) continue;
    if (value < 0 || value > 10_000) return failed("Fees need to be between $0 and $10,000.");
    fees[key] = value;
  }

  const { error } = await supabase
    .from("settings")
    .update({
      ...fees,
      carver_applications_open: bool(form, "carver_applications_open"),
      vendor_applications_open: bool(form, "vendor_applications_open"),
      application_deadline: text(form, "application_deadline"),
      event_year: year,
      date_override_start: start,
      date_override_end: end,
      admission_daily: text(form, "admission_daily"),
      admission_pass: text(form, "admission_pass"),
      ticket_url: url(form, "ticket_url"),
      gate_open_time: text(form, "gate_open_time"),
      hero_line1: text(form, "hero_line1"),
      hero_line2: text(form, "hero_line2"),
      hero_line3: text(form, "hero_line3"),
      hero_para1: text(form, "hero_para1"),
      hero_para2: text(form, "hero_para2"),
      hero_bg_path: text(form, "hero_bg_path"),
      hero_wash: wash,
      presenting_enabled: presentingEnabled,
      presenting_sponsor_id: presentingId,
      featured_carver_ids: featured,
      contact_phone: text(form, "contact_phone"),
      contact_text: text(form, "contact_text"),
      contact_email: text(form, "contact_email"),
      contact_address: text(form, "contact_address"),
      parking_copy: text(form, "parking_copy"),
      visit_reedsport_url: url(form, "visit_reedsport_url"),
      carver_application_url: url(form, "carver_application_url"),
      vendor_application_url: url(form, "vendor_application_url"),
      stat_visitors: text(form, "stat_visitors"),
      carvers_page_mode: mode,
    })
    .eq("id", 1);

  if (error) return failed(error.message);

  // The year, the dates and the contact block appear on every page.
  publish(ALL_TAGS, PUBLIC_PATHS);
  return SAVED;
}

/** Used by the Sponsors screen when uploading a new sponsorship form PDF. */
export async function saveSponsorshipForm(path: string | null): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .update({ sponsorship_form_path: path })
    .eq("id", 1);

  if (error) return failed(error.message);

  publish([TAGS.settings], ["/sponsorship"]);
  return SAVED;
}
