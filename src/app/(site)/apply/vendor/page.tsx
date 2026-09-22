import Link from "next/link";
import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SiteNav from "@/components/site/SiteNav";
import { InfoPanel } from "@/components/site/form";
import { money } from "@/lib/applications";
import { getEventContext } from "@/lib/queries";
import VendorApplicationForm from "./VendorApplicationForm";

export const metadata: Metadata = {
  title: "Vendor application",
  description:
    "Apply for booth space at the Oregon Divisional Chainsaw Carving Championship in Reedsport, Oregon — food, craft, collectible, commercial and non-profit vendors.",
  alternates: { canonical: "/apply/vendor" },
};

/** The Chamber opens and closes applications from the admin — never cache that. */
export const dynamic = "force-dynamic";

export default async function VendorApplicationPage() {
  const { rangeLabel, passesHref, settings, year, editionLabel, dates } =
    await getEventContext();
  const open = settings.vendor_applications_open;
  const deadline = settings.application_deadline?.trim();

  // Set-up is the Wednesday before the Thursday the event opens.
  const setup = new Date(dates.start);
  setup.setUTCDate(setup.getUTCDate() - 1);
  const setupLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(setup);

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="visit" />
      <PageHeader
        image="/images/site/header-visit.jpg"
        eyebrow={`${editionLabel} · ${rangeLabel}`}
        title="Vendor application"
        intro={`Four days of carving draws thousands of people to Rainbow Plaza. Food, craft, collectible, commercial and non-profit booths sit right alongside the carvers.`}
        desaturate
      />

      <main id="main">
        {open ? (
          <>
            {deadline && (
              <p className="mx-6 mt-12 border-l-4 border-gold bg-fir-850 px-6 py-5 text-[17px] leading-[1.5] text-body md:mx-16">
                <strong className="text-cream">Applications close {deadline}.</strong> Spaces are
                only reserved once the application and full payment are in.
              </p>
            )}

            <div className="grid grid-cols-1 gap-12 px-6 py-12 md:px-16 md:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
              <VendorApplicationForm
                year={year}
                rates={settings}
                contactEmail={settings.contact_email}
              />

              <aside className="flex flex-col gap-6 lg:sticky lg:top-[120px] lg:self-start">
                <InfoPanel title="Fee schedule">
                  <Rate label="Food, wine or beer" value={money(settings.vendor_fee_food)} member={money(settings.vendor_fee_food_member)} />
                  <Rate label="All other vendors" value={money(settings.vendor_fee_other)} member={money(settings.vendor_fee_other_member)} />
                  <Rate label="Each additional space" value={money(settings.vendor_fee_additional_space)} />
                  <Rate label="Electrical, per space" value={money(settings.vendor_fee_electrical)} note="Food vendors only" />
                  <p className="m-0 pt-1 text-sub">
                    Booths are 10&apos; x 12&apos; with a 10-foot selling front. Chamber members pay
                    the lower rate.
                  </p>
                </InfoPanel>

                <InfoPanel title="Dates and times">
                  <p className="m-0">
                    <strong className="text-cream">Event:</strong> {rangeLabel}, Thursday through
                    Sunday — Father&apos;s Day weekend.
                  </p>
                  <p className="m-0">
                    <strong className="text-cream">Set-up:</strong> {setupLabel}, 2 p.m. to 7 p.m.
                  </p>
                  <p className="m-0">
                    <strong className="text-cream">Location:</strong> 313 Rainbow Plaza, Reedsport,
                    Oregon — the gravel lot beside the post office.
                  </p>
                  <p className="m-0">
                    Booths open by 9 a.m. daily and stay open until the ticket booth closes. No
                    vehicles in the event space after 8 a.m.
                  </p>
                </InfoPanel>

                <InfoPanel title="Food vendors">
                  <p className="m-0">
                    You need a temporary restaurant license from the Douglas County Department of
                    Health, and a certificate of commercial general liability insurance naming the
                    Chamber and the City of Reedsport as additional insured.
                  </p>
                  <p className="m-0">
                    Send the certificate with your application rather than bringing it with you —
                    that leaves time to correct mistakes. Without a correct certificate you
                    can&apos;t set up, and there&apos;s no refund.
                  </p>
                </InfoPanel>

                <InfoPanel title="Selling carvings?">
                  <p className="m-0">
                    Competing carvers who only want to sell their own carvings should use the{" "}
                    <Link href="/apply/carver" className="font-bold text-gold">
                      carver application
                    </Link>{" "}
                    instead — it has a cheaper selling space near your carving booth.
                  </p>
                </InfoPanel>
              </aside>
            </div>
          </>
        ) : (
          <section className="mx-6 mt-12 mb-4 flex flex-col items-start gap-6 border border-line bg-fir-850 px-6 py-10 md:mx-16 md:px-12 md:py-12">
            <h2 className="display m-0 text-(length:--text-band-h2) font-black">
              Applications aren&apos;t open yet
            </h2>
            <p className="m-0 max-w-[65ch] text-[18px] leading-[1.6] text-body">
              The Chamber opens vendor applications for the {year} championship in the spring
              {deadline ? `, with a deadline of ${deadline}` : ""}. Sign up below and we&apos;ll
              email you the day they open, or call 541-271-3495 to ask.
            </p>
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}?subject=${encodeURIComponent(`${year} ODCCC vendor application`)}`}
                className="btn-outline"
              >
                Ask about a booth
              </a>
            )}
          </section>
        )}

        <NewsletterBand source="/apply/vendor" />
      </main>
    </>
  );
}

function Rate({
  label,
  value,
  member,
  note,
}: {
  label: string;
  value: string;
  member?: string;
  note?: string;
}) {
  return (
    <p className="m-0 flex items-baseline justify-between gap-4">
      <span>
        {label}
        {note && <span className="block text-[13px] text-sub">{note}</span>}
      </span>
      <span className="shrink-0 text-right font-bold text-cream">
        {value}
        {member && <span className="block text-[13px] font-normal text-sub">{member} members</span>}
      </span>
    </p>
  );
}
