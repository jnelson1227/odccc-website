import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SectionHead from "@/components/site/SectionHead";
import SiteNav from "@/components/site/SiteNav";
import { edition, ordinal } from "@/lib/dates";
import { getCarverCountLabel, getEventContext, getWinnerRows } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How a group of carvers with chainsaws turned a timber town into the Chainsaw Carving Capital of Oregon — and every champion since 2000.",
  alternates: { canonical: "/our-story" },
};

export default async function OurStoryPage() {
  const { rangeLabel, passesHref, year } = await getEventContext();
  const [rows, carverCount] = await Promise.all([getWinnerRows(), getCarverCountLabel()]);

  // The timeline is static content in code — it changes about once a decade,
  // except the last entry, which follows the current year.
  const timeline = [
    {
      when: "2000",
      title: "The first championship",
      body: "Reedsport natives Bob and Cindy King — Bob a championship carver himself — launch the event at Rainbow Plaza.",
    },
    {
      when: "2011",
      title: "Best in Oregon",
      body: "The Oregon Festivals & Events Association names it Best Performing Art Festival in Oregon, and the Legislature designates Reedsport the Chainsaw Carving Capital of Oregon.",
    },
    {
      when: "Today",
      title: "A living gallery",
      body: "Produced by volunteers of the Reedsport/Winchester Bay Chamber of Commerce. Many sculptures are donated to the city and installed around town.",
    },
    {
      when: String(year),
      title: `The ${ordinal(edition(year))} championship`,
      body: `${carverCount} carvers, four days, Father's Day weekend.`,
    },
  ];

  return (
    <>
      <SiteNav dateLabel={rangeLabel} passesHref={passesHref} active="event" />
      <PageHeader
        image="/images/site/hero-bg.jpg"
        eyebrow="Since 2000"
        title="Our story"
        intro="How a group of carvers with chainsaws turned a timber town into the Chainsaw Carving Capital of Oregon."
      />

      <main id="main">
        <section className="grid grid-cols-1 gap-10 px-6 py-12 md:px-16 md:py-16 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="display m-0 text-(length:--text-section-h2) font-black leading-[0.95]">
              Born from the working forest
            </h2>
            <p className="m-0 text-[19px] leading-[1.6] text-body">
              Chainsaw carving grew out of the Pacific Northwest timber industry — the same tools
              that shaped towns like Reedsport, turned to art. It&apos;s a living craft, passed on
              through demonstration, competition and mentorship.
            </p>
            <p className="m-0 text-[19px] leading-[1.6] text-body">
              Every June, carvers from across the country and around the world bring that tradition
              back to Rainbow Plaza.
            </p>
          </div>

          <ol className="m-0 flex list-none flex-col p-0">
            {timeline.map((entry) => (
              <li
                key={entry.when}
                className="grid grid-cols-1 gap-3 border-t border-line py-7 sm:grid-cols-[160px_1fr] sm:gap-8 lg:grid-cols-[200px_1fr]"
              >
                <span className="display text-[clamp(2.5rem,4vw,4rem)] font-black leading-[0.9] text-gold">
                  {entry.when}
                </span>
                <span className="flex flex-col gap-2">
                  <span className="display text-[30px] font-black">{entry.title}</span>
                  <span className="max-w-[760px] text-[18px] leading-[1.55] text-body">
                    {entry.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-7 px-6 pb-20 md:px-16">
          <SectionHead eyebrow="Hall of champions" title="Past winners" id="winners" />

          {rows.length === 0 ? (
            <p className="m-0 text-body">Results will be posted here after the championship.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-cream">
                <thead>
                  <tr>
                    {["Year", "Division", "1st", "2nd", "3rd"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-[2px] text-sub"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.year}-${row.division}`}>
                      <td className="display border-t border-line px-4 py-4 text-[24px] font-black text-gold">
                        {row.year}
                      </td>
                      <td className="border-t border-line px-4 py-4 text-[14px] font-bold uppercase tracking-[1px] text-sub">
                        {row.division}
                      </td>
                      <Place name={row.first} />
                      <Place name={row.second} />
                      <Place name={row.third} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="m-0 text-[14px] text-sub">
            Earlier years to be added from the Chamber archive.
          </p>
        </section>

        <NewsletterBand source="/our-story" />
      </main>
    </>
  );
}

/** A placing we don't have on record yet reads as "—", not as a blank cell. */
function Place({ name }: { name: string | null }) {
  return (
    <td className="border-t border-line px-4 py-4 text-[16px]">
      {name ?? <span className="text-sub">—</span>}
    </td>
  );
}
