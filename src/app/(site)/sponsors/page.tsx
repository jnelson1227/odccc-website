import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SectionHead from "@/components/site/SectionHead";
import SiteNav from "@/components/site/SiteNav";
import { imageUrl } from "@/lib/images";
import { getEventContext, getSponsorsByLevel } from "@/lib/queries";
import type { Sponsor } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our sponsors",
  description:
    "The businesses and organizations that bring world-class chainsaw carving to Reedsport, Oregon every Father's Day weekend.",
  alternates: { canonical: "/sponsors" },
};

export default async function SponsorsPage() {
  const { rangeLabel, passesHref, year } = await getEventContext();
  const { year: sponsorYear, isPrevious, groups, presenting } = await getSponsorsByLevel();

  // Tiles for levels that carry logos; a name list for the rest.
  const tileGroups = groups.filter((g) => g.showLogo);
  const listGroups = groups.filter((g) => !g.showLogo);

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="sponsors" />
      <PageHeader
        image="/images/site/header-sponsors.jpg"
        eyebrow="The people who make it happen"
        title="Our sponsors"
        intro="The championship runs on volunteers and the businesses that back them. Thank you to every sponsor who helps bring world-class carving to Reedsport."
      />

      <main id="main">
        <section className="flex flex-col gap-7 px-6 pb-10 pt-12 md:px-16 md:pt-16">
          <SectionHead eyebrow={`${year} presenting sponsor`} title="Presented by…" />

          {presenting ? (
            <div className="flex flex-col items-start justify-between gap-6 border-2 border-gold bg-gold/10 p-8 md:flex-row md:items-center md:p-10">
              <div className="flex items-center gap-8">
                {imageUrl(presenting.logo_path) ? (
                  <Image
                    src={imageUrl(presenting.logo_path)!}
                    alt={presenting.name}
                    width={320}
                    height={110}
                    className="max-h-[110px] w-auto object-contain"
                  />
                ) : (
                  <span className="display text-[clamp(2rem,4vw,2.75rem)] font-black leading-none">
                    {presenting.name}
                  </span>
                )}
              </div>
              <p className="m-0 max-w-md text-[18px] text-body">
                Thank you to {presenting.name} for presenting the {year} championship.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-6 border-2 border-dashed border-gold p-8 md:flex-row md:items-center md:p-10">
              <div className="flex flex-col gap-2">
                <span className="display text-[clamp(2rem,4vw,2.75rem)] font-black leading-none">
                  This could be your name
                </span>
                <span className="text-[18px] text-body">
                  The {year} Presenting Sponsor spot is open — one available.
                </span>
              </div>
              <Link href="/sponsorship" className="btn-gold flex min-h-11 items-center">
                See sponsorship levels
              </Link>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-7 px-6 pb-14 md:px-16">
          <SectionHead
            eyebrow="Thank you"
            title={`${sponsorYear} sponsors`}
            id="thanks"
          />

          {isPrevious && (
            <p className="m-0 text-[17px] text-body">
              The {year} sponsor list is still coming together. These are the businesses that
              backed the {sponsorYear} championship — thank you.
            </p>
          )}

          {groups.length === 0 ? (
            <p className="m-0 text-body">
              Sponsors for this year will be listed here as they sign on.
            </p>
          ) : (
            <>
              {tileGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-4">
                  <h3 className="display m-0 text-[24px] font-black text-gold">{group.label}</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.sponsors.map((sponsor) => (
                      <SponsorTile key={sponsor.id} sponsor={sponsor} label={group.label} />
                    ))}
                  </div>
                </div>
              ))}

              {listGroups.map((group) => (
                <p key={group.label} className="m-0 text-[16px] leading-[1.7] text-body">
                  <strong className="text-cream">{group.label}:</strong>{" "}
                  {group.sponsors.map((s, i) => (
                    <span key={s.id}>
                      {i > 0 && ", "}
                      {s.website ? (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body no-underline hover:text-gold"
                        >
                          {s.name}
                        </a>
                      ) : (
                        s.name
                      )}
                    </span>
                  ))}
                  .
                </p>
              ))}
            </>
          )}
        </section>

        <section className="mx-6 mb-20 flex flex-col items-start justify-between gap-6 bg-gold p-8 text-brown md:mx-16 md:flex-row md:items-center md:p-12">
          <div className="flex flex-col gap-2">
            <h2 className="display m-0 text-(length:--text-band-h2) font-black leading-none">
              Become a sponsor
            </h2>
            <p className="m-0 text-[18px]">
              Levels from $250 to $10,000 — including cash and in-kind options.
            </p>
          </div>
          <Link
            href="/sponsorship"
            className="flex min-h-11 items-center bg-brown px-[30px] py-[18px] text-[17px] font-bold text-cream no-underline"
          >
            See levels &amp; pricing
          </Link>
        </section>

        <NewsletterBand source="/sponsors" />
      </main>
    </>
  );
}

function SponsorTile({ sponsor, label }: { sponsor: Sponsor; label: string }) {
  const logo = imageUrl(sponsor.logo_path);

  const inner = (
    <>
      <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-gold">{label}</span>
      {logo ? (
        <Image
          src={logo}
          alt={sponsor.name}
          width={220}
          height={70}
          className="max-h-[70px] w-auto object-contain"
        />
      ) : (
        <span className="display text-[20px] font-bold leading-[1.1]">{sponsor.name}</span>
      )}
    </>
  );

  const classes =
    "flex h-[130px] flex-col items-center justify-center gap-[6px] border border-line bg-fir-850 p-4 text-center text-cream no-underline";

  return sponsor.website ? (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className={`${classes} transition-colors hover:border-gold`}
    >
      {inner}
    </a>
  ) : (
    <div className={classes}>{inner}</div>
  );
}
