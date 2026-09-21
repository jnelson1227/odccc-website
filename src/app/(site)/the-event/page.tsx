import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import EventJsonLd from "@/components/site/EventJsonLd";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SectionHead from "@/components/site/SectionHead";
import SiteNav from "@/components/site/SiteNav";
import { getCarverCountLabel, getEventContext } from "@/lib/queries";

export const metadata: Metadata = {
  title: "The event",
  description:
    "What happens over four days at the Oregon Divisional Chainsaw Carving Championship: two divisions, a daily Quick Carve, live auctions every evening, and about eighty tons of Oregon timber.",
  alternates: { canonical: "/the-event" },
};

/**
 * Photos from the 2026 championship, in ChamberApp/assets/websizephotos.
 * Alt text describes what is actually in each frame.
 */
const AT_WORK = [
  {
    src: "/images/event/carver-hand.jpg",
    alt: "A carver in ear defenders shaping a giant open hand from a single log, chainsaw mid-cut",
  },
  {
    src: "/images/event/carver-shell.jpg",
    alt: "A carver kneeling with a chainsaw, cutting detail into a large carved shell",
  },
  {
    src: "/images/event/carver-sasquatch.jpg",
    alt: "A carver beside a nearly finished Sasquatch figure carved from a standing log",
  },
];

/**
 * Mixed orientation on purpose — a standing figure and a crowd shot want
 * different shapes. The grid below is CSS columns rather than a fixed-aspect
 * grid so nothing gets cropped; a carved horse's head in a landscape box
 * loses the horse.
 */
const GALLERY = [
  {
    src: "/images/event/sculpture-chief.jpg",
    alt: "A finished carving of a figure in a feathered headdress, standing in the carving lot",
    w: 1200,
    h: 1600,
  },
  {
    src: "/images/event/crowd-booths.jpg",
    alt: "Visitors walking the row of carving booths on a sunny day",
    w: 1600,
    h: 1067,
  },
  {
    src: "/images/event/sculpture-horse.jpg",
    alt: "A carved horse's head emerging from a timber rail, sanded and finished",
    w: 1200,
    h: 1600,
  },
  {
    src: "/images/event/sculpture-bear.jpg",
    alt: "A painted carved bear holding an oversized beer stein",
    w: 1600,
    h: 1067,
  },
  {
    src: "/images/event/carver-blank.jpg",
    alt: "A carver cutting into a fresh log under a canopy, with saws racked behind him",
    w: 1600,
    h: 1200,
  },
  {
    src: "/images/event/sculpture-donkey.jpg",
    alt: "A visitor sitting on a life-size carved donkey",
    w: 1200,
    h: 1600,
  },
  {
    src: "/images/event/booths-row.jpg",
    alt: "The row of carving booths, with fresh blanks and finished pieces waiting",
    w: 1600,
    h: 1200,
  },
  {
    src: "/images/event/sculpture-salmon.jpg",
    alt: "A long scorched-wood fish carved from one log, mounted on a stump base",
    w: 1600,
    h: 1067,
  },
  {
    src: "/images/event/crowd-watching.jpg",
    alt: "A crowd gathered under the canopies to watch a carver work",
    w: 1600,
    h: 1067,
  },
];

const WHAT_TO_EXPECT = [
  {
    title: "Open booths",
    body: "Every carver works in an open booth. Watch up close, ask questions, meet the artists.",
  },
  {
    title: "Quick Carve",
    body: "Daily at 10:30 a.m. — 90 minutes on the clock, finished sculptures at the buzzer.",
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

export default async function TheEventPage() {
  const ctx = await getEventContext();
  const { settings, year, rangeLabel, editionLabel, passesHref } = ctx;
  const carverCount = await getCarverCountLabel();

  return (
    <>
      <EventJsonLd ctx={ctx} />
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="event" />
      <PageHeader
        image="/images/event/header-event.jpg"
        desaturate
        eyebrow={`${editionLabel} · ${rangeLabel}`}
        title="The championship"
        intro={`${carverCount} carvers, four days and about eighty tons of Oregon timber, on the waterfront at Rainbow Plaza in Reedsport.`}
      />

      <main id="main">
        {/* ---------------------------------------------------- what it is */}
        <section className="grid grid-cols-1 gap-10 px-6 pb-12 pt-12 md:px-16 md:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHead eyebrow="Since 2000" title="What it is" />
            <p className="m-0 text-[20px] leading-[1.55] text-body">
              <strong className="text-cream">
                A chainsaw carving competition, held outdoors, that anyone can walk straight into.
              </strong>{" "}
              Carvers come from across the United States and from as far as Canada, the U.K. and
              Argentina. Over four days each one turns a raw log into a finished sculpture, in a
              booth you can stand beside the whole time.
            </p>
            <p className="m-0 text-[18px] leading-[1.55] text-body">
              It has run every Father&apos;s Day weekend since 2000, when Reedsport natives Bob and
              Cindy King started it at Rainbow Plaza. In 2011 the Oregon Festivals &amp; Events
              Association named it the best performing-art festival in the state, and the
              Legislature designated Reedsport the Chainsaw Carving Capital of Oregon. It is run
              by volunteers of the Reedsport/Winchester Bay Chamber of Commerce.
            </p>
            <p className="m-0 text-[18px] leading-[1.55] text-body">
              Many of the finished sculptures are donated to the City of Reedsport and installed
              around town, so the work outlasts the weekend.
            </p>
            <Link
              href="/our-story"
              className="flex min-h-11 items-center self-start text-[16px] font-bold text-gold no-underline hover:underline"
            >
              Read the full story and past winners →
            </Link>
          </div>

          <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-8 self-start border-t border-line pt-8 lg:border-t-0 lg:pt-0">
            <Stat value={carverCount} label="carvers competing" />
            <Stat value="4 days" label="Thursday to Father's Day" />
            <Stat value="2" label="divisions — Pro and Semi-Pro" />
            <Stat value={settings.stat_visitors ?? "4,000+"} label="visitors" />
          </dl>
        </section>

        {/* ---------------------------------------------------- at work */}
        <section aria-label="Carvers at work" className="grid grid-cols-1 gap-4 px-6 pb-14 md:px-16 sm:grid-cols-3">
          {AT_WORK.map((photo, i) => (
            <div key={photo.src} className="relative aspect-3/4 w-full border-2 border-line">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </section>

        {/* ---------------------------------------------------- what to expect */}
        <section className="flex flex-col gap-7 px-6 pb-14 md:px-16">
          <SectionHead eyebrow="At the championship" title="What to expect" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_TO_EXPECT.map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-[10px] border border-line bg-fir-850 p-7"
              >
                <h3 className="display m-0 text-[28px] font-black leading-none">{card.title}</h3>
                <p className="m-0 text-[16px] leading-[1.55] text-body">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- how it works */}
        <section className="flex flex-col gap-7 px-6 pb-14 md:px-16">
          <SectionHead
            eyebrow="How the competition works"
            title="Two contests at once"
            link={{ href: "/schedule", label: "See the full schedule →" }}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Panel title="The main event">
              Each carver works one sculpture across all four days, starting from a raw log on
              Thursday morning. They&apos;re judged on Sunday, and the Pro and Semi-Pro champions
              are crowned at the awards ceremony that afternoon.
            </Panel>
            <Panel title="The Quick Carve">
              A separate contest every day: a fresh log, ninety minutes on the clock, finished
              pieces at the buzzer. It&apos;s the thing to watch if you only have an hour — you see
              a whole sculpture happen start to finish.
            </Panel>
            <Panel title="The auctions">
              Every Quick Carve piece is auctioned the same evening, with a final auction on
              Sunday afternoon. It&apos;s how most people end up taking a carving home, and a large
              part of what funds the championship.
            </Panel>
          </div>
        </section>

        {/* ---------------------------------------------------- gallery */}
        <section className="flex flex-col gap-7 px-6 pb-14 md:px-16">
          <SectionHead
            eyebrow={`From the ${year - 1} championship`}
            title="Four days, in pictures"
            link={{ href: "/carvers", label: `Meet the ${carverCount} carvers →` }}
          />
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {GALLERY.map((photo) => (
              <figure key={photo.src} className="m-0 flex break-inside-avoid flex-col gap-2">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.w}
                  height={photo.h}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-auto w-full border-2 border-line"
                />
                <figcaption className="text-[13px] leading-snug text-sub">{photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- cta */}
        <section className="mx-6 mb-20 flex flex-col items-start justify-between gap-6 border border-line bg-fir-850 px-6 py-8 md:mx-16 md:flex-row md:items-center md:px-12 md:py-10">
          <div className="flex flex-col gap-2">
            <h2 className="display m-0 text-(length:--text-band-h2) font-black">Coming along?</h2>
            <p className="m-0 text-[18px] text-body">
              {rangeLabel} at Rainbow Plaza. Gates open daily at{" "}
              {settings.gate_open_time ?? "8:00 a.m."} — {settings.admission_daily ?? "—"} a day,{" "}
              {settings.admission_pass ?? "—"} for all four.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/visit" className="btn-gold flex min-h-11 items-center justify-center">
              Plan your visit
            </Link>
            <Link
              href="/schedule"
              className="btn-outline flex min-h-11 items-center justify-center"
            >
              See the schedule
            </Link>
          </div>
        </section>

        <NewsletterBand source="/the-event" />
      </main>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="sr-only">{label}</dt>
      <dd className="m-0 flex flex-col gap-1">
        <span className="display text-(length:--text-stat) font-black leading-[0.9] text-gold">
          {value}
        </span>
        <span className="text-[15px] leading-[1.4] text-body">{label}</span>
      </dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-l-2 border-gold bg-fir-850 px-6 py-6">
      <h3 className="display m-0 text-[30px] font-black leading-none">{title}</h3>
      <p className="m-0 text-[16px] leading-[1.55] text-body">{children}</p>
    </div>
  );
}
