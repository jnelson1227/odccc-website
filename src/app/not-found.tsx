import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/site/Footer";
import SiteNav from "@/components/site/SiteNav";
import { getEventContext } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/carvers", label: "Carvers" },
  { href: "/schedule", label: "Schedule" },
  { href: "/visit", label: "Plan your visit" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/our-story", label: "History & past winners" },
];

/**
 * Lives at the app root rather than inside the (site) group so it catches
 * every unmatched URL, not just ones under a matching segment.
 *
 * Plenty of links to the old Wix site are on Facebook, in Travel Oregon
 * listings and in printed material. Anything the redirects in next.config
 * don't catch lands here, so it points at the pages people actually want.
 */
export default async function NotFound() {
  const { rangeLabel, passesHref, settings } = await getEventContext();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} />
      <main
        id="main"
        className="flex flex-grow flex-col items-start gap-6 px-6 py-20 md:px-16 md:py-28"
      >
        <div className="eyebrow">404</div>
        <h1 className="display m-0 text-(length:--text-page-h1) font-black leading-[0.85]">
          We couldn&apos;t find that page
        </h1>
        <p className="m-0 max-w-[640px] text-(length:--text-subtitle) leading-[1.45] text-body">
          The championship site moved recently, so an older link may have gone stale. Here is
          where most people are heading:
        </p>
        <nav aria-label="Popular pages" className="flex flex-wrap gap-3">
          <Link href="/" className="btn-gold flex min-h-11 items-center">
            Home
          </Link>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-outline flex min-h-11 items-center"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
