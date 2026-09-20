import { isoWithPacificOffset } from "@/lib/dates";
import type { EventContext } from "@/lib/queries";

/**
 * schema.org Event markup, on the homepage and the schedule page. Dates are
 * computed from the year like everywhere else; the venue never changes.
 */
export default function EventJsonLd({ ctx }: { ctx: EventContext }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oregonccc.com";

  const data = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: `${ctx.year} Oregon Divisional Chainsaw Carving Championship`,
    alternateName: "ODCCC",
    description:
      "Four days of world-class chainsaw carving, daily Quick Carve contests and live auctions at Rainbow Plaza in Reedsport, Oregon.",
    startDate: isoWithPacificOffset(ctx.dates.start, "start"),
    endDate: isoWithPacificOffset(ctx.dates.end, "end"),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    location: {
      "@type": "Place",
      name: "Rainbow Plaza",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rainbow Plaza, Highway 101",
        addressLocality: "Reedsport",
        addressRegion: "OR",
        postalCode: "97467",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Reedsport/Winchester Bay Chamber of Commerce",
      url: siteUrl,
      ...(ctx.settings.contact_email ? { email: ctx.settings.contact_email } : {}),
      ...(ctx.settings.contact_phone ? { telephone: ctx.settings.contact_phone } : {}),
    },
    ...(ctx.settings.admission_daily
      ? {
          offers: {
            "@type": "Offer",
            name: "Daily admission",
            price: ctx.settings.admission_daily.replace(/[^0-9.]/g, "") || undefined,
            priceCurrency: "USD",
            url: ctx.passesHref.startsWith("http") ? ctx.passesHref : `${siteUrl}/visit#passes`,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Values come from our own database, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
