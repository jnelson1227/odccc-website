import Link from "next/link";
import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SiteNav from "@/components/site/SiteNav";
import { InfoPanel } from "@/components/site/form";
import { money } from "@/lib/applications";
import { setupDayLabel } from "@/lib/dates";
import { getEventContext } from "@/lib/queries";
import CarverApplicationForm from "./CarverApplicationForm";

export const metadata: Metadata = {
  title: "Carver application",
  description:
    "Apply to compete at the Oregon Divisional Chainsaw Carving Championship in Reedsport, Oregon. Pro and Semi-Pro divisions, Father's Day weekend.",
  alternates: { canonical: "/apply/carver" },
};

/**
 * Read every time: the Chamber opens and closes applications from the admin,
 * and a cached page would keep taking them for hours after they closed.
 */
export const dynamic = "force-dynamic";

/** Straight from the FAQ page of the Chamber's printed application. */
const FAQ = [
  "There is no charge to carve, and all wood is provided for both main pieces and Quick Carves.",
  "There is no required theme — for main pieces or for Quick Carves.",
  "You're judged on your main piece on the final day, and the carving stays yours to keep or sell.",
  "You get a 10' x 12' carving space, plus 10 feet behind it for tents and personal setup.",
  "You may have one assistant, 18 or older. Assistants can help with the main piece as long as they don't alter its shape, and may not help with the Quick Carve.",
  "Breakfast and lunch are provided Thursday through Sunday for carvers and their assistants.",
  "Lodging isn't provided. Dry camping is available in the designated area near the event space.",
  "No pets on site. Children must be supervised at all times, and only you and your assistant may be inside your carving space.",
  "You may display a few pieces for sale in front of your booth, as long as they don't block walkways or create a tripping hazard.",
];

export default async function CarverApplicationPage() {
  const { rangeLabel, passesHref, settings, year, editionLabel, dates } = await getEventContext();
  const setupLabel = setupDayLabel(dates);
  const open = settings.carver_applications_open;
  const deadline = settings.application_deadline?.trim();

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="carvers" />
      <PageHeader
        image="/images/site/header-carvers.jpg"
        eyebrow={`${editionLabel} · ${rangeLabel}`}
        title="Carver application"
        intro={`Apply to compete at the ${year} championship. Thirty Professional and ten Semi-Professional positions, four days of carving at Rainbow Plaza, and a crowd that watches every cut.`}
      />

      <main id="main">
        {open ? (
          <>
            {deadline && (
              <p className="mx-6 mt-12 border-l-4 border-gold bg-fir-850 px-6 py-5 text-[17px] leading-[1.5] text-body md:mx-16">
                <strong className="text-cream">Applications close {deadline}.</strong> Earlier is
                better — but selection isn&apos;t first come, first served.
              </p>
            )}

            <section
              aria-labelledby="before-you-apply"
              className="flex flex-col gap-6 px-6 pt-12 md:px-16 md:pt-16"
            >
              <div className="flex flex-col gap-2">
                <div className="eyebrow">Read this first</div>
                <h2 id="before-you-apply" className="display m-0 text-(length:--text-band-h2) font-black">
                  Before you apply
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <InfoPanel title="What you'll need">
                  <p className="m-0">
                    <strong className="text-cream">Two or more photos of your work</strong>, ready to
                    upload from your phone or computer. They&apos;re what the committee judges your
                    application on, so send your best pieces.
                  </p>
                  <p className="m-0">
                    A completed application is required every year, even for returning carvers.
                    Selection isn&apos;t first come, first served — every application is reviewed
                    against the others in the same division, and submitting one doesn&apos;t guarantee
                    acceptance.
                  </p>
                  <p className="m-0">
                    You pick your own division. There are 30 Professional and 10 Semi-Professional
                    positions, and the committee doesn&apos;t place carvers into divisions or move them
                    once assigned.
                  </p>
                </InfoPanel>

                <InfoPanel title="Selling your carvings">
                  <p className="m-0">
                    You may display a few pieces for sale in front of your carving booth at no charge,
                    as long as they don&apos;t block walkways or create a tripping hazard.
                  </p>
                  <p className="m-0">
                    If you want a dedicated selling space near your booth, it&apos;s{" "}
                    <strong className="text-cream">{money(settings.carver_selling_space_fee)}</strong>{" "}
                    for a 10&apos; x 12&apos; space, carvings only — you can add it at the end of this
                    form. To sell anything else you need the{" "}
                    <Link href="/apply/vendor" className="font-bold text-gold">
                      regular vendor application
                    </Link>
                    .
                  </p>
                  {settings.contact_email && (
                    <p className="m-0">
                      Paperwork, a longer bio or questions can go to{" "}
                      <a href={`mailto:${settings.contact_email}`} className="font-bold text-gold">
                        {settings.contact_email}
                      </a>
                      .
                    </p>
                  )}
                </InfoPanel>
              </div>

              <InfoPanel title="Good to know">
                <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-3 p-0 md:grid-cols-2">
                  {FAQ.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[12px] h-[6px] w-[6px] shrink-0 bg-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </InfoPanel>
            </section>

            <section
              aria-labelledby="the-application"
              className="flex flex-col gap-8 px-6 py-12 md:px-16 md:py-16"
            >
              <div className="flex flex-col gap-2">
                <div className="eyebrow">{year} championship</div>
                <h2 id="the-application" className="display m-0 text-(length:--text-band-h2) font-black">
                  The application
                </h2>
              </div>
              <div className="max-w-[900px]">
                <CarverApplicationForm
                  year={year}
                  sellingSpaceFee={settings.carver_selling_space_fee}
                  setupLabel={setupLabel}
                  contactEmail={settings.contact_email}
                  contactPhone={settings.contact_phone}
                  contactAddress={settings.contact_address}
                />
              </div>
            </section>
          </>
        ) : (
          <section className="mx-6 mt-12 mb-4 flex flex-col items-start gap-6 border border-line bg-fir-850 px-6 py-10 md:mx-16 md:px-12 md:py-12">
            <h2 className="display m-0 text-(length:--text-band-h2) font-black">
              Applications aren&apos;t open yet
            </h2>
            <p className="m-0 max-w-[65ch] text-[18px] leading-[1.6] text-body">
              The Chamber opens carver applications for the {year} championship once the committee
              sets the dates for review{deadline ? ` — the deadline is ${deadline}` : ""}. Sign up
              below and we&apos;ll email you the day they open, or call 541-271-3495 to ask.
            </p>
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}?subject=${encodeURIComponent(`${year} ODCCC carver application`)}`}
                className="btn-outline"
              >
                Ask about applying
              </a>
            )}
          </section>
        )}

        <NewsletterBand source="/apply/carver" />
      </main>
    </>
  );
}
