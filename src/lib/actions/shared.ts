import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import type { Tag } from "@/lib/cache";

export { IDLE, SAVED, failed, type ActionState } from "./state";

/**
 * Drop the cached data for the pages a save touches, so "live on the site" is
 * true the moment the toast appears.
 *
 * updateTag rather than revalidateTag: revalidateTag schedules an expiry, so a
 * volunteer clicking "View site" straight after saving could still be served
 * the old page. updateTag expires it immediately, which is the whole promise
 * of the toast.
 */
export function publish(tags: Tag[], paths: string[] = []) {
  for (const tag of tags) updateTag(tag);
  for (const path of paths) revalidatePath(path);
}

/** Trim to a string, or null when there's nothing left. */
export function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Trim to a string, or "" — for columns that are NOT NULL. */
export function requiredText(form: FormData, key: string): string {
  return text(form, key) ?? "";
}

export function bool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

export function int(form: FormData, key: string): number | null {
  const raw = text(form, key);
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/** A textarea of one-per-line values → a string[] for a Postgres array column. */
export function lines(form: FormData, key: string): string[] {
  const raw = form.get(key);
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * A URL we're willing to put in an href. Only http(s) — a "javascript:" or
 * "data:" URL pasted into an admin field must never become a live link.
 */
export function url(form: FormData, key: string): string | null {
  const raw = text(form, key);
  if (raw === null) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** "Colby Herrington" → "colby-herrington". */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
