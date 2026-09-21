import Link from "next/link";
import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SectionHead from "@/components/site/SectionHead";
import SiteNav from "@/components/site/SiteNav";
import { edition, ordinal } from "@/lib/dates";
import { imageUrl } from "@/lib/images";
import {
  availabilityLabel,
  getEventContext,
  getLevelAvailability,
  getSponsorshipLevels,
} from "@/lib/queries";
import type { SponsorshipLevel } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { year } = await getEventContext();
  return {
    title: "Become a sponsor",
    description: `Sponsorship levels for the ${year} Oregon Divisional Chainsaw Carving Championship, from $250 to $10,000 — cash and in-kind.`,
    alternates: { canonical: "/sponsorship" },
  };
}

export default async function SponsorshipPage() {
  const { rangeLabel, passesHref, settings, year } = await getEventContext();
  const [levels, taken] = await Promise.all([getSponsorshipLevels(), getLevelAvailability()]);

  const [featured, ...rest] = levels;
  const pair = rest.slice(0, 2);
  const remaining = rest.slice(2);
  const formPdf = imageUrl(settings.sponsorship_form_path);

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="sponsors" />
      <PageHeader
        image="/images/site/header-sponsors.jpg"
        eyebrow={`Sponsorship opportunities · ${year}`}
        title={`Sponsor the ${ordinal(edition(year))}`}
        intro="Put your name on Oregon's biggest chainsaw carving event — and help bring world-class carvers, bigger prizes and more visitors to Reedsport."
      />

      <main id="main">
        <section className="grid grid-cols-2 gap-8 border-b border-line px-6 pb-14 pt-12 md:px-16 md:pt-16 lg:grid-cols-4">
          <Stat value={settings.stat_visitors ?? "4,000+"} label="visitors at Rainbow Plaza" />
          <Stat value="4 days" label="of crowds, carving and live auctions" />
          <Stat value={`${edition(year)} years`} label="running since 2000" />
          <Stat value="2011" label="Ovation Award — Best Performing Art Festival in Oregon" />
        </section>

        <section className="flex flex-col gap-7 px-6 py-14 md:px-16">
          <SectionHead
            eyebrow={`${year} opportunities`}
            title="Sponsorship levels"
            link={
              formPdf
                ? {
                    href: formPdf,
                    label: "Download the sponsorship form (PDF) →",
                    external: true,
                  }
                : undefined
            }
          />

          {featured && (
            <div className="grid grid-cols-1 gap-8 border-2 border-gold bg-gold/10 p-6 md:p-10 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
              <div className="flex flex-col gap-[14px]">
                <div className="text-[12px] font-bold uppercase tracking-[2px] text-gold">
                  {featured.max_available === 1 ? "Exclusive · " : ""}
                  {availabilityLabel(featured, taken.get(featured.id) ?? 0)}
                </div>
                <h3 className="display m-0 text-[clamp(2.5rem,5vw,4rem)] font-black leading-[0.9]">
                  {featured.name}
                </h3>
                <div className="display text-[clamp(2.25rem,4.5vw,3.5rem)] font-black leading-none text-gold">
                  {featured.price_label}
                </div>
                <p className="m-0 text-[16px] leading-[1.5] text-body">
                  Your name on the championship itself — everywhere it appears, all season long.
                </p>
              </div>
              <ul className="m-0 grid list-none grid-cols-1 content-center gap-4 p-0 text-[17px] leading-[1.45] text-cream sm:grid-cols-2 sm:gap-x-7">
                {featured.benefits.map((benefit) => (
                  <Benefit key={benefit}>{benefit}</Benefit>
                ))}
              </ul>
            </div>
          )}

          {pair.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {pair.map((level) => (
                <LevelCard key={level.id} level={level} taken={taken.get(level.id) ?? 0} />
              ))}
            </div>
          )}

          {remaining.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {remaining.map((level) => (
                <LevelCard key={level.id} level={level} taken={taken.get(level.id) ?? 0} />
              ))}
            </div>
          )}

          {!formPdf && (
            <p className="m-0 text-[15px] text-sub">
              A printable sponsorship form will be posted here once it&apos;s uploaded in the
              admin.
            </p>
          )}

          <Link
            href="/sponsors"
            className="flex min-h-11 items-center self-start text-[16px] font-bold text-gold no-underline hover:underline"
          >
            See who sponsors the championship →
          </Link>
        </section>

        <section className="mx-6 mb-20 flex flex-col items-start justify-between gap-6 bg-gold p-8 text-brown md:mx-16 md:flex-row md:items-center md:p-12">
          <div className="flex flex-col gap-2">
            <h2 className="display m-0 text-(length:--text-band-h2) font-black leading-none">
              Let&apos;s talk sponsorship
            </h2>
            <p className="m-0 text-[18px]">
              Call {settings.contact_phone} or email {settings.contact_email}
            </p>
          </div>
          <a
            href={`mailto:${settings.contact_email ?? ""}?subject=${encodeURIComponent(`${year} ODCCC sponsorship`)}`}
            className="flex min-h-11 items-center bg-brown px-[30px] py-[18px] text-[17px] font-bold text-cream no-underline"
          >
            Become a sponsor
          </a>
        </section>

        <NewsletterBand source="/sponsorship" />
      </main>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="display text-(length:--text-stat) font-black leading-[0.9] text-gold">
        {value}
      </span>
      <span className="text-[15px] leading-[1.4] text-body">{label}</span>
    </div>
  );
}

function LevelCard({ level, taken }: { level: SponsorshipLevel; taken: number }) {
  const availability = availabilityLabel(level, taken);
  const sold = availability === "Sold";

  return (
    <div
      className={`flex flex-col gap-4 border bg-fir-850 px-6 py-7 ${
        sold ? "border-line opacity-70" : "border-line"
      }`}
    >
      <div className="text-[12px] font-bold uppercase tracking-[2px] text-gold">{availability}</div>
      <h3 className="display m-0 text-[clamp(1.75rem,2.6vw,2.375rem)] font-black leading-none">
        {level.name}
      </h3>
      <div className="display text-[28px] font-bold text-cream">{level.price_label}</div>
      <ul className="m-0 flex list-none flex-col gap-[10px] p-0 text-[15px] leading-[1.45] text-body">
        {level.benefits.map((benefit) => (
          <Benefit key={benefit}>{benefit}</Benefit>
        ))}
      </ul>
    </div>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-[10px]">
      <span aria-hidden="true" className="font-bold text-gold">
        —
      </span>
      <span>{children}</span>
    </li>
  );
}
