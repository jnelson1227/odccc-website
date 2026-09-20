import Image from "next/image";
import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import OregonMap from "@/components/site/OregonMap";
import PageHeader from "@/components/site/PageHeader";
import SectionHead from "@/components/site/SectionHead";
import SiteNav from "@/components/site/SiteNav";
import { getEventContext } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Plan your visit",
  description:
    "Rainbow Plaza sits on Highway 101 in Reedsport, where the Umpqua River meets the Pacific beside the Oregon Dunes. Getting here, what to expect and what else to do.",
  alternates: { canonical: "/visit" },
};

const DIRECTIONS =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("Rainbow Plaza, Reedsport, OR 97467");

const WHAT_TO_EXPECT = [
  {
    title: "Open booths",
    body: "Every carver works in an open booth. Watch up close, ask questions, meet the artists.",
  },
  {
    title: "Quick Carve",
    body: "Daily at 10:30 a.m. — 90 minutes on the clock, a finished sculpture at the buzzer.",
  },
  {
    title: "Live auctions",
    body: "Take home a one-of-a-kind piece. Quick Carve sculptures sell at every evening auction.",
  },
  {
    title: "Food & vendors",
    body: "Local food, drinks and vendors on the plaza all four days.",
  },
];

/** Where the Chamber's visitor guide lives, unless settings point somewhere else. */
const VISIT_REEDSPORT = "https://visitreedsport.com";

/**
 * What's actually in the guide. Figures and wording follow the Chamber's own
 * launch press release (ChamberApp/media-kit/press-outreach-kit.md), so the two
 * can't drift apart.
 */
const FIELD_GUIDE_FEATURES = [
  {
    title: "Nearly 250 places on one map",
    body: "Every business, park and public place in Reedsport, Winchester Bay and Gardiner — with hours, phone numbers and directions.",
  },
  {
    title: "An “Open Now” filter",
    body: "What's actually serving at the moment you look, rather than a phone number from 2014.",
  },
  {
    title: "A dozen local guides",
    body: "Written here, not scraped: hiking, fishing, birdwatching, dog-friendly stops, what to do in the rain, and a three-day weekend itinerary.",
  },
  {
    title: "Events, weather and tides",
    body: "What's on while you're in town, plus live conditions for Winchester Bay.",
  },
];

/** Facts here come from the Chamber's launch press release, not from memory. */
const AROUND_TOWN = [
  {
    title: "Oregon Dunes",
    body: "The tallest dunes in the forty-mile national recreation area are the ones just south of town — hiking, OHV riding and camping.",
  },
  {
    title: "Dean Creek Elk",
    body: "Sixty to a hundred Roosevelt elk, visible from the roadside year-round, three miles east on Highway 38. No hike, no fee.",
  },
  {
    title: "Old Town Reedsport",
    body: "A few walkable blocks: an art gallery carrying fifty-plus Oregon artists with a wine room in back, a brewery, a distillery and a bakery worth the queue.",
  },
  {
    title: "Winchester Bay",
    body: "A working harbor where the crab boats unload, and the still-operating Umpqua River Lighthouse above it.",
  },
];

export default async function VisitPage() {
  const { rangeLabel, passesHref, settings } = await getEventContext();
  const ticketUrl = settings.ticket_url?.trim();
  // Admin-editable, but the guide is the Chamber's own site, so it has a default.
  const guideUrl = settings.visit_reedsport_url?.trim() || VISIT_REEDSPORT;

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="visit" />
      <PageHeader
        image="/images/site/header-visit.jpg"
        eyebrow="Rainbow Plaza · Reedsport, Oregon"
        title="Plan your visit"
        intro="Where the Umpqua River meets the Pacific, on Highway 101 beside the Oregon Dunes. Come for the carving, stay for the coast."
      />

      <main id="main">
        <section className="grid grid-cols-1 items-center gap-10 px-6 pb-14 pt-12 md:px-16 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            <SectionHead eyebrow="Getting here" title="Find us" />
            <p className="m-0 text-[20px] leading-[1.55] text-body">
              <strong className="text-cream">Rainbow Plaza, downtown Reedsport.</strong> Reedsport
              sits on Highway 101 where Oregon Route 38 meets the coast — halfway between Florence
              and Coos Bay.
            </p>
            <p className="m-0 text-[18px] leading-[1.55] text-body">
              Nearest airports: Southwest Oregon Regional (North Bend) and Eugene.{" "}
              {settings.parking_copy?.trim() ? (
                settings.parking_copy.trim()
              ) : (
                <span className="text-sub">
                  Parking details are being confirmed — check back before the event.
                </span>
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-[14px]">
              <a
                href={DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex min-h-11 items-center justify-center"
              >
                Get directions
              </a>
              <a
                id="passes"
                href={ticketUrl ?? `mailto:${settings.contact_email ?? ""}`}
                {...(ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="btn-outline flex min-h-11 items-center justify-center"
              >
                {ticketUrl ? "Buy passes" : "Ask about passes"}
              </a>
            </div>
            {!ticketUrl && (
              <p className="m-0 text-[15px] text-sub">
                Passes are sold at the gate: {settings.admission_daily ?? "—"} a day,{" "}
                {settings.admission_pass ?? "—"} for all four. Online sales are coming.
              </p>
            )}
          </div>

          <div className="flex justify-center border border-line bg-fir-850 p-6 md:p-8">
            <OregonMap variant="large" className="h-auto w-full max-w-[460px]" />
          </div>
        </section>

        <section className="flex flex-col gap-7 px-6 pb-14 md:px-16">
          <SectionHead eyebrow="At the championship" title="What to expect" />
          <CardGrid cards={WHAT_TO_EXPECT} />
        </section>

        <section className="flex flex-col gap-7 px-6 pb-14 md:px-16">
          <SectionHead eyebrow="Year-round" title="The sculpture trail" />
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <p className="m-0 text-[20px] leading-[1.55] text-body">
              <strong className="text-cream">The championship never really leaves.</strong> Many
              finished sculptures are donated to the City of Reedsport and installed around town —
              turning Reedsport into a living, open-air gallery you can walk any day of the year.
            </p>
            <div className="flex h-[220px] items-center justify-center border-2 border-dashed border-line px-4 text-center text-[13px] font-bold uppercase tracking-[1.5px] text-sub">
              Sculpture trail map — coming soon
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-7 px-6 pb-20 md:px-16">
          <SectionHead eyebrow="Make a weekend of it" title="Around Reedsport" />

          <p className="m-0 max-w-[820px] text-[20px] leading-[1.55] text-body">
            Reedsport sits inside the Umpqua River valley rather than out on the open coast, and
            it shows: <strong className="text-cream">roughly 179 sunny days a year</strong> — more
            than Newport, Florence, Cannon Beach or Portland. Father&apos;s Day weekend is a good
            bet.
          </p>

          <div className="grid grid-cols-1 gap-0 border border-line bg-fir-850 lg:grid-cols-[1.05fr_1fr]">
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open visitreedsport.com, the Chamber's visitor guide"
              className="group relative block aspect-16/9 w-full overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[420px]"
            >
              <Image
                src="/images/site/visit-reedsport.jpg"
                alt="Aerial view of the Umpqua River bridge at Reedsport, with the town, the river and forested hills beyond"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-linear-to-t from-fir-900/70 to-transparent" />
              <span className="absolute bottom-4 left-4 bg-cream px-3 py-2 text-[13px] font-bold uppercase tracking-[1.5px] text-fir-900">
                visitreedsport.com
              </span>
            </a>

            <div className="flex flex-col gap-5 p-6 md:p-10">
              <div className="flex flex-col gap-3">
                <div className="eyebrow">From the Chamber</div>
                <h3 className="display m-0 text-[clamp(2rem,3.4vw,2.75rem)] font-black leading-[0.95]">
                  The Reedsport Field Guide
                </h3>
                <p className="m-0 text-[18px] leading-[1.55] text-body">
                  The Chamber keeps a free visitor guide to Reedsport, Winchester Bay and
                  Gardiner — the same volunteers who run this championship. It&apos;s the fastest
                  way to turn four days of carving into a proper weekend on the coast.
                </p>
              </div>

              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {FIELD_GUIDE_FEATURES.map((feature) => (
                  <li key={feature.title} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[2px] font-bold text-gold">
                      —
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[16px] font-bold text-cream">{feature.title}</span>
                      <span className="text-[15px] leading-[1.5] text-body">{feature.body}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={guideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold flex min-h-11 items-center justify-center"
                >
                  Open the guide
                </a>
                <span className="text-[14px] text-sub">
                  Free, no sign-in, and it adds to your phone&apos;s home screen.
                </span>
              </div>
            </div>
          </div>

          <CardGrid cards={AROUND_TOWN} />
        </section>

        <NewsletterBand source="/visit" />
      </main>
    </>
  );
}

function CardGrid({ cards }: { cards: { title: string; body: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col gap-[10px] border border-line bg-fir-850 p-7"
        >
          <h3 className="display m-0 text-[28px] font-black leading-none">{card.title}</h3>
          <p className="m-0 text-[16px] leading-[1.55] text-body">{card.body}</p>
        </div>
      ))}
    </div>
  );
}
