/**
 * Cache tags for the public pages. Admin saves call revalidateTag with the
 * tags their change touches, so "Saved" really does mean live on the site.
 */
export const TAGS = {
  settings: "settings",
  carvers: "carvers",
  sponsors: "sponsors",
  levels: "levels",
  schedule: "schedule",
  winners: "winners",
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];

/** Every tag — for a save that could plausibly affect any page. */
export const ALL_TAGS: Tag[] = Object.values(TAGS);
