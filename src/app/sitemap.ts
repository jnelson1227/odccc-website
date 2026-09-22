import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getAllCarverSlugs } from "@/lib/queries";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllCarverSlugs();
  const now = new Date();

  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/the-event", priority: 0.9, changeFrequency: "monthly" },
    { path: "/carvers", priority: 0.9, changeFrequency: "weekly" },
    { path: "/schedule", priority: 0.8, changeFrequency: "monthly" },
    { path: "/visit", priority: 0.8, changeFrequency: "monthly" },
    { path: "/sponsors", priority: 0.6, changeFrequency: "monthly" },
    { path: "/sponsorship", priority: 0.6, changeFrequency: "monthly" },
    { path: "/our-story", priority: 0.5, changeFrequency: "monthly" },
    { path: "/apply/carver", priority: 0.5, changeFrequency: "monthly" },
    { path: "/apply/vendor", priority: 0.5, changeFrequency: "monthly" },
  ];

  return [
    ...pages.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/carvers/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
