import Link from "next/link";
import type { Metadata } from "next";
import CarverCard from "@/components/site/CarverCard";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SiteNav from "@/components/site/SiteNav";
import { applicationHref } from "@/lib/applications";
import { capitalize, numberToWords } from "@/lib/dates";
import { getEventContext, getLineup } from "@/lib/queries";
import type { CarverWithStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Carvers",
  description:
    "The Pro and Semi-Pro carvers competing at the Oregon Divisional Chainsaw Carving Championship in Reedsport, Oregon.",
  alternates: { canonical: "/carvers" },
};

/** "the U.S., Canada, the U.K. and Argentina" — built from the actual lineup. */
function countriesSentence(carvers: CarverWithStatus[]): string {
  const display: Record<string, string> = {
    USA: "the U.S.",
    "United Kingdom": "the U.K.",
  };

  const counts = new Map<string, number>();
  for (const c of carvers) {
    const name = display[c.country ?? "USA"] ?? c.country ?? "the U.S.";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  // Home country first, then by how many carvers come from each, then A–Z so
  // the sentence reads the same way every build.
  const names = [...counts.entries()]
    .sort((a, b) => {
      if (a[0] === "the U.S.") return -1;
      if (b[0] === "the U.S.") return 1;
      return b[1] - a[1] || a[0].localeCompare(b[0], "en");
    })
    .map(([name]) => name);

  if (names.length === 0) return "across the country";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export default async function CarversPage() {
  const { rangeLabel, passesHref, settings, year } = await getEventContext();
  const lineup = await getLineup();
  const all = [...lineup.pro, ...lineup.semiPro];
  const carverApplication = applicationHref(settings, "carver");
  const applicationsOpen = Boolean(settings.carver_application_url?.trim()) || settings.carver_applications_open;

  const intro =
    all.length > 0
      ? `${capitalize(numberToWords(all.length))} artists from ${countriesSentence(all)} — each working in an open booth where you can watch every cut, ask questions and see a log become a sculpture over four days.`
      : "Carvers work in open booths where you can watch every cut, ask questions and see a log become a sculpture over four days.";

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="carvers" />
      <PageHeader
        image="/images/site/header-carvers.jpg"
        eyebrow={`${lineup.year} lineup · Pro & Semi-Pro`}
        title="Meet the carvers"
        intro={intro}
      />

      <main id="main">
        {lineup.isPrevious && (
          <p className="mx-6 mt-10 border-l-4 border-gold bg-fir-850 px-6 py-5 text-[17px] leading-[1.5] text-body md:mx-16">
            <strong className="text-cream">
              The {year} lineup hasn&apos;t been announced yet.
            </strong>{" "}
            Here are the carvers who competed in {lineup.year}. Sign up below and we&apos;ll email
            you when the {year} field is set.
          </p>
        )}

        <DivisionSection
          id="pro"
          eyebrow="Main event competitors"
          title="Pro division"
          carvers={lineup.pro}
          counts={{ pro: lineup.pro.length, semi: lineup.semiPro.length }}
          className="px-6 pb-10 pt-12 md:px-16 md:pt-16"
        />

        <DivisionSection
          id="semi"
          eyebrow="Rising talent"
          title="Semi-Pro division"
          carvers={lineup.semiPro}
          className="px-6 pb-16 pt-8 md:px-16 md:pb-[72px]"
        />

        <section className="mx-6 mb-12 flex flex-col items-start justify-between gap-6 border border-line bg-fir-850 px-6 py-8 md:mx-16 md:mb-[72px] md:flex-row md:items-center md:px-12 md:py-10">
          <div className="flex flex-col gap-2">
            <h2 className="display m-0 text-(length:--text-band-h2) font-black">
              Are you a carver?
            </h2>
            <p className="m-0 text-[18px] text-body">
              {applicationsOpen
                ? `Applications for the ${year} championship are open. Pro and Semi-Pro divisions.`
                : `Applications for the ${year} championship open soon. Pro and Semi-Pro divisions.`}
            </p>
          </div>
          {carverApplication.startsWith("http") ? (
            <a
              href={carverApplication}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold flex min-h-11 items-center"
            >
              Apply to carve
            </a>
          ) : (
            <Link
              href={carverApplication}
              className={`${applicationsOpen ? "btn-gold" : "btn-outline"} flex min-h-11 items-center`}
            >
              {applicationsOpen ? "Apply to carve" : "About applying"}
            </Link>
          )}
        </section>

        <NewsletterBand source="/carvers" />
      </main>
    </>
  );
}

function DivisionSection({
  id,
  eyebrow,
  title,
  carvers,
  counts,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  carvers: CarverWithStatus[];
  counts?: { pro: number; semi: number };
  className: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`flex flex-col gap-8 ${className}`}>
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="flex flex-col gap-2">
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="display m-0 text-(length:--text-section-h2) font-black leading-[0.95]">
            <span id={`${id}-h`}>{title}</span>
          </h2>
        </div>
        {counts && (
          <div className="flex gap-2">
            <Link
              href="#pro"
              className="flex min-h-11 items-center bg-gold px-5 py-3 text-[15px] font-bold text-brown no-underline"
            >
              Pro · {counts.pro}
            </Link>
            <Link
              href="#semi"
              className="flex min-h-11 items-center border border-line px-5 py-3 text-[15px] font-bold text-cream no-underline hover:border-gold hover:text-gold"
            >
              Semi-Pro · {counts.semi}
            </Link>
          </div>
        )}
      </div>

      {carvers.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
          {carvers.map((carver, i) => (
            <CarverCard key={carver.id} carver={carver} priority={i < 6} />
          ))}
        </div>
      ) : (
        <p className="m-0 text-body">No carvers announced for this division yet.</p>
      )}
    </section>
  );
}
