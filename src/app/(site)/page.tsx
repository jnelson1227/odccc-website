import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import CarverCard from "@/components/site/CarverCard";
import EventJsonLd from "@/components/site/EventJsonLd";
import NewsletterBand from "@/components/site/NewsletterBand";
import OregonMap from "@/components/site/OregonMap";
import SiteNav from "@/components/site/SiteNav";
import { imageUrl } from "@/lib/images";
import { renderBold, stripBold } from "@/lib/markdown";
import { getCarverCountLabel, getEventContext, getFeaturedCarvers } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { settings, year, rangeLabel, editionLabel } = await getEventContext();
  return {
    title: {
      absolute: `Oregon Divisional Chainsaw Carving Championship — ${rangeLabel}, Reedsport, Oregon`,
    },
    description:
      stripBold(settings.hero_para1) ||
      `The ${editionLabel} championship, ${rangeLabel} at Rainbow Plaza in Reedsport, Oregon.`,
    alternates: { canonical: "/" },
    openGraph: {
      title: `Oregon Divisional Chainsaw Carving Championship — ${year}`,
      description: stripBold(settings.hero_para1) ?? undefined,
      url: "/",
    },
  };
}

export default async function HomePage() {
  const ctx = await getEventContext();
  const { settings, rangeLabel, editionLabel, passesHref } = ctx;
  const [featured, carverCount] = await Promise.all([
    getFeaturedCarvers(),
    getCarverCountLabel(),
  ]);

  const heroBg = imageUrl(settings.hero_bg_path) ?? "/images/site/hero-bg.jpg";
  const wash = Number(settings.hero_wash ?? 0.8);

  return (
    <>
      <EventJsonLd ctx={ctx} />

      <header className="relative flex flex-col overflow-hidden lg:h-[1000px]">
        <Image
          src={heroBg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-fir-900" style={{ opacity: wash }} />
        <div className="absolute inset-x-0 bottom-0 h-[220px] bg-linear-to-b from-transparent to-fir-900" />

        <SiteNav
          variant="hero"
          dateLabel={rangeLabel}
          passesHref={passesHref}
          active={undefined}
        />

        <div
          id="main"
          className="relative grid flex-grow grid-cols-1 gap-8 px-6 pb-12 pt-10 md:px-16 lg:grid-cols-[minmax(0,980px)_1fr] lg:gap-3 lg:pb-0 lg:pl-16 lg:pr-10"
        >
          <div className="flex flex-col justify-center gap-5 lg:pb-10">
            <div className="display flex items-center gap-4 text-(length:--text-hero-eyebrow) font-bold leading-none tracking-[2px] text-gold">
              <span aria-hidden="true" className="h-1 w-8 shrink-0 bg-gold md:w-14" />
              {editionLabel} · {rangeLabel}
            </div>

            <p className="display m-0 text-(length:--text-hero) font-black leading-[0.84] tracking-[-1px]">
              {settings.hero_line1}
              <br />
              <span className="text-gold">{settings.hero_line2}</span>
              <br />
              {settings.hero_line3}
            </p>

            {settings.hero_para1 && (
              <p className="m-0 max-w-[720px] text-(length:--text-lead) leading-[1.45] text-body text-pretty">
                {renderBold(settings.hero_para1, "font-bold text-cream")}
              </p>
            )}
            {settings.hero_para2 && (
              <p className="m-0 max-w-[720px] text-(length:--text-lead) leading-[1.45] text-body text-pretty">
                {renderBold(settings.hero_para2, "font-bold text-cream")}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-[18px] lg:pb-16">
            <h1 className="m-0 flex justify-center">
              <Image
                src="/images/site/odccc-logo.png"
                alt="Oregon Divisional Chainsaw Carving Championship logo — Reedsport, OR"
                width={296}
                height={197}
                priority
                className="w-[240px] max-w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] sm:w-[320px] lg:w-[390px]"
              />
            </h1>

            {settings.presenting_enabled && <PresentingSponsor ctx={ctx} />}

            <div className="flex items-center gap-4 border border-cream/30 bg-fir-900/70 px-4 py-3">
              <OregonMap className="h-[43px] w-[58px] shrink-0" />
              <div className="flex flex-col gap-[3px]">
                <span className="display text-[19px] font-black leading-none">Reedsport, OR</span>
                <span className="text-[12px] uppercase tracking-[1px] text-sub">
                  Rainbow Plaza · Hwy 101
                </span>
              </div>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-3 self-stretch lg:max-w-none">
              <Link
                href="/visit"
                className="btn-gold shadow-[4px_4px_0_#08130d] min-h-11 flex items-center justify-center"
              >
                Plan your visit
              </Link>
              <Link
                href="/sponsorship"
                className="btn-outline min-h-11 flex items-center justify-center"
              >
                Sponsor the championship
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="carvers-h"
        className="flex flex-col gap-8 px-6 pb-16 pt-5 md:px-16"
      >
        <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="eyebrow">{ctx.year - 1} final carvings</div>
            <h2
              id="carvers-h"
              className="display m-0 text-(length:--text-section-h2) font-black leading-[0.95]"
            >
              Meet the carvers
            </h2>
          </div>
          <Link
            href="/carvers"
            className="flex min-h-11 items-center text-[16px] font-bold text-gold no-underline hover:underline"
          >
            See all {carverCount} carvers →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((carver, i) => (
              <CarverCard key={carver.id} carver={carver} variant="home" priority={i < 3} />
            ))}
          </div>
        ) : (
          <p className="m-0 text-body">
            Featured carvers are chosen in the admin under Event &amp; homepage.
          </p>
        )}
      </section>

      <NewsletterBand source="/" />
    </>
  );
}

/** The "PRESENTED BY" lockup under the logo, once a presenting sponsor signs on. */
async function PresentingSponsor({
  ctx,
}: {
  ctx: Awaited<ReturnType<typeof getEventContext>>;
}) {
  const { getSponsorsByLevel } = await import("@/lib/queries");
  const { presenting } = await getSponsorsByLevel();
  if (!presenting) return null;

  const logo = imageUrl(presenting.logo_path);
  const inner = logo ? (
    <Image
      src={logo}
      alt={presenting.name}
      width={240}
      height={72}
      className="max-h-[72px] w-auto object-contain"
    />
  ) : (
    <span className="display text-[20px] font-black text-cream">{presenting.name}</span>
  );

  return (
    <div className="-mt-1 mb-[6px] flex flex-col items-center gap-3">
      <div className="flex items-center gap-[14px] text-[13px] font-bold uppercase tracking-[4px] text-sub">
        <span aria-hidden="true" className="h-px w-9 bg-sub" />
        Presented by
        <span aria-hidden="true" className="h-px w-9 bg-sub" />
      </div>
      {presenting.website ? (
        <a
          href={presenting.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[72px] w-[240px] items-center justify-center no-underline"
        >
          {inner}
        </a>
      ) : (
        <div className="flex h-[72px] w-[240px] items-center justify-center">{inner}</div>
      )}
      <span className="sr-only">
        {ctx.year} presenting sponsor: {presenting.name}
      </span>
    </div>
  );
}
