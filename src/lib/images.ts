const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BUCKET = "odccc-media";

/**
 * Photos arrive two ways: the seed points at files committed under
 * /public/images, while anything uploaded through the admin is a path inside
 * the `odccc-media` Storage bucket. Resolve either to something <Image> can use.
 */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** "Colby Herrington" → "CH", for the "Photo coming" placeholder card. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
