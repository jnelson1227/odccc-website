import type { MetadataRoute } from "next";
import { SITE_URL, IS_INDEXABLE } from "@/lib/site-url";


export default function robots(): MetadataRoute.Robots {
  // On a preview alias, disallow everything and advertise no sitemap — handing
  // out a sitemap for a host that should not be indexed only invites the crawl.
  if (!IS_INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
