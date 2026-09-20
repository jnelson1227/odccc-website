/**
 * The canonical address of this site, used for metadata, canonical links, the
 * sitemap, robots.txt, Open Graph images and Event JSON-LD.
 *
 * Three sources, in order:
 *
 * 1. NEXT_PUBLIC_SITE_URL — set this once the real domain is live.
 * 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel fills this in automatically, so a
 *    fresh deploy has correct canonical and sharing URLs without anyone having
 *    to know the deploy URL in advance.
 * 3. The real domain, for local builds.
 *
 * Getting this wrong is quiet but expensive: canonical tags and Open Graph URLs
 * pointing at the wrong host is exactly how a new site fails to replace an old
 * one in search results.
 */
function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "https://oregonccc.com";
}

export const SITE_URL = resolve();

/**
 * Whether search engines should index this deployment.
 *
 * Only the real domain should ever be indexed. A vercel.app alias serves the
 * same pages with a canonical tag pointing at itself, so letting Google index
 * one means the staging URL and oregonccc.com compete as separate sites for the
 * same content — and the alias, being older in the index, can win. This site
 * lives on search traffic, so that is worth preventing rather than repairing.
 *
 * Derived from the host instead of a separate flag, so cutover is still the one
 * act of setting NEXT_PUBLIC_SITE_URL: indexing turns itself on at the same
 * moment, with nothing to remember.
 */
export const IS_INDEXABLE = !/\.vercel\.app$/i.test(new URL(SITE_URL).hostname);
