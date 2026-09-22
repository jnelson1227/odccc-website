/**
 * Carvers give us their social presence in whatever form they use themselves:
 * "@yorkshirecarver", "Timber Town Carvings", or a full URL.
 *
 * Handles turn into links cleanly. Page *names* do not — "Sculptures In Motion
 * LLC" is not a URL slug, and inventing facebook.com/SculpturesInMotionLLC
 * would either 404 or, worse, land a visitor on a stranger's page. So a value
 * we can't resolve is shown as plain text rather than guessed at.
 */

export type Social = "facebook" | "instagram" | "tiktok";

const BASE: Record<Social, string> = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
};

export const SOCIAL_LABEL: Record<Social, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

/** What to show: the handle without its "@", or the page name as given. */
export function socialLabel(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  }
  return trimmed.replace(/^@/, "");
}

/**
 * A link, or null when the value is a display name we can't resolve to a
 * profile. Single-token values are treated as handles; anything with a space
 * is a name someone typed for humans to read.
 */
export function socialUrl(platform: Social, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
    } catch {
      return null;
    }
  }

  const handle = trimmed.replace(/^@/, "");
  // Handles are one token of the characters the platforms actually allow.
  if (!/^[A-Za-z0-9._-]+$/.test(handle)) return null;

  return BASE[platform] + handle;
}
