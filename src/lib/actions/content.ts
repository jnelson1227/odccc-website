"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireOwner } from "@/lib/auth";
import { TAGS } from "@/lib/cache";
import {
  bool,
  failed,
  int,
  publish,
  requiredText,
  SAVED,
  text,
  type ActionState,
} from "./shared";

// ------------------------------------------------------------ schedule

export async function saveScheduleItem(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const dayType = text(form, "day_type");
  if (dayType !== "weekday" && dayType !== "sunday") {
    return failed("Pick Thursday–Saturday or Sunday.");
  }

  const timeLabel = requiredText(form, "time_label");
  const title = requiredText(form, "title");
  if (!timeLabel) return failed("Every row needs a time, e.g. 10:30 a.m. – noon.");
  if (!title) return failed("Every row needs a title.");

  const row = {
    day_type: dayType,
    time_label: timeLabel,
    title,
    description: text(form, "description"),
    highlight: bool(form, "highlight"),
    sort_order: int(form, "sort_order") ?? 0,
  };

  const id = text(form, "id");
  const { error } = id
    ? await supabase.from("schedule_items").update(row).eq("id", id)
    : await supabase.from("schedule_items").insert(row);

  if (error) return failed(error.message);

  publish([TAGS.schedule], ["/schedule"]);
  return SAVED;
}

export async function deleteScheduleItem(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  if (!id) return failed("Which row?");

  const { error } = await supabase.from("schedule_items").delete().eq("id", id);
  if (error) return failed(error.message);

  publish([TAGS.schedule], ["/schedule"]);
  return { status: "success", message: "Row removed — live on the site" };
}

// ------------------------------------------------------------ winners

const DIVISIONS = ["Pro", "Semi-Pro", "Quick Carve", "Other"];

export async function saveWinner(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const year = int(form, "year");
  const place = int(form, "place");
  const division = text(form, "division");
  const carverName = requiredText(form, "carver_name");

  if (!year || year < 2000 || year > 2100) return failed("Which year was this?");
  if (!place || place < 1 || place > 10) return failed("Place has to be between 1 and 10.");
  if (!division || !DIVISIONS.includes(division)) return failed("Pick a division.");
  if (!carverName) return failed("Who won?");

  const row = {
    year,
    division,
    place,
    carver_name: carverName,
    carver_id: text(form, "carver_id"),
  };

  const id = text(form, "id");

  // One winner per year + division + place, so re-entering a placing corrects
  // it instead of failing on the unique index.
  const { error } = id
    ? await supabase.from("winners").update(row).eq("id", id)
    : await supabase.from("winners").upsert(row, { onConflict: "year,division,place" });

  if (error) return failed(error.message);

  publish([TAGS.winners], ["/our-story"]);
  return SAVED;
}

export async function deleteWinner(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  if (!id) return failed("Which result?");

  const { error } = await supabase.from("winners").delete().eq("id", id);
  if (error) return failed(error.message);

  publish([TAGS.winners], ["/our-story"]);
  return { status: "success", message: "Result removed — live on the site" };
}

// ------------------------------------------------------------ media library

export async function saveMedia(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const path = text(form, "path");
  const alt = requiredText(form, "alt");
  if (!path) return failed("Upload an image first.");
  if (!alt) return failed("Every image needs alt text describing what it shows.");

  const { error } = await supabase.from("media").insert({ path, alt });
  if (error) return failed(error.message);

  return { status: "success", message: "Added to the photo library" };
}

export async function deleteMedia(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  const path = text(form, "path");
  if (!id) return failed("Which image?");

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return failed(error.message);

  // Drop the file too, so the bucket doesn't fill with orphans. A file that's
  // already gone isn't a problem worth reporting.
  if (path && !path.startsWith("/")) {
    await supabase.storage.from("odccc-media").remove([path]);
  }

  return { status: "success", message: "Removed from the photo library" };
}

// ------------------------------------------------------------ subscribers

export async function setSubscriberStatus(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  const status = text(form, "status");
  if (!id || (status !== "subscribed" && status !== "unsubscribed")) {
    return failed("Couldn't update that subscriber.");
  }

  const { error } = await supabase.from("subscribers").update({ status }).eq("id", id);
  if (error) return failed(error.message);

  return {
    status: "success",
    message: status === "unsubscribed" ? "Unsubscribed" : "Resubscribed",
  };
}

export async function deleteSubscriber(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = text(form, "id");
  if (!id) return failed("Which subscriber?");

  const { error } = await supabase.from("subscribers").delete().eq("id", id);
  if (error) return failed(error.message);

  return { status: "success", message: "Deleted" };
}

// ------------------------------------------------------------ admins

export async function addAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireOwner();
  const supabase = await createClient();

  const email = text(form, "email")?.toLowerCase();
  const role = text(form, "role");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return failed("That doesn't look like an email address.");
  }
  if (role !== "owner" && role !== "editor") return failed("Pick a role.");

  const { error } = await supabase
    .from("admins")
    .upsert({ email, role }, { onConflict: "email" });
  if (error) return failed(error.message);

  return {
    status: "success",
    message: `${email} is on the list. Now set them a password so they can sign in.`,
  };
}

export async function removeAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireOwner();
  const supabase = await createClient();

  const email = text(form, "email")?.toLowerCase();
  if (!email) return failed("Which admin?");

  if (email === me.email.toLowerCase()) {
    return failed("You can't remove your own access.");
  }

  // Never let the last owner be removed — nobody could manage admins again.
  const { data: owners } = await supabase.from("admins").select("email").eq("role", "owner");
  if ((owners ?? []).length <= 1 && (owners ?? []).some((o) => o.email === email)) {
    return failed("That's the only owner. Make someone else an owner first.");
  }

  const { error } = await supabase.from("admins").delete().eq("email", email);
  if (error) return failed(error.message);

  return { status: "success", message: `${email} can no longer sign in.` };
}
