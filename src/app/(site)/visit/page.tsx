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

const AROUND_TOWN = [
  {
    title: "Oregon Dunes",
    body: "The largest coastal dune system in North America — hiking, OHV riding and camping.",
  },
  {
    title: "Dean Creek Elk",
    body: "Roosevelt elk year-round, three miles east of town on Route 38.",
  },
  {
    title: "Umpqua Discovery Center",
    body: "Natural and cultural history of the lower Umpqua, right downtown.",
  },
  {
    title: "Winchester Bay",
    body: "Marina, fishing and crabbing where the Umpqua meets the Pacific.",
  },
];

export default async function VisitPage() {
  const { rangeLabel, passesHref, settings } = await getEventContext();
  const visitReedsport = settings.visit_reedsport_url?.trim();
  const ticketUrl = settings.ticket_url?.trim();

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
          <SectionHead
            eyebrow="Make a weekend of it"
            title="Around Reedsport"
            link={
              visitReedsport
                ? {
                    href: visitReedsport,
                    label: "Where to stay & eat — Visit Reedsport →",
                    external: true,
                  }
                : undefined
            }
          />
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
