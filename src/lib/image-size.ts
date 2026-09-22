import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { imageSize } from "image-size";

export type Dimensions = { width: number; height: number };

/**
 * The intrinsic shape of a photo, so a page can show it the way it was taken
 * rather than cropping a landscape shot into a portrait frame.
 *
 * Seed photos are paths under /public; anything uploaded through the admin is
 * a public URL on Supabase Storage. Only the header is needed, but both are
 * read whole — carver pages are prerendered, so this runs at build time and on
 * the revalidation that follows an admin save, not per visitor.
 *
 * Returns null when the size can't be read, and callers fall back to a fixed
 * frame; an unreadable photo should crop, not break the page.
 */
export async function imageDimensions(src: string | null): Promise<Dimensions | null> {
  if (!src) return null;

  try {
    let bytes: Buffer;
    if (src.startsWith("/")) {
      bytes = await readFile(path.join(process.cwd(), "public", src));
    } else {
      const res = await fetch(src);
      if (!res.ok) return null;
      bytes = Buffer.from(await res.arrayBuffer());
    }

    const { width, height } = imageSize(bytes);
    return width && height ? { width, height } : null;
  } catch {
    return null;
  }
}
