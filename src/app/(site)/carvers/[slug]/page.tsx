import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NewsletterBand from "@/components/site/NewsletterBand";
import SiteNav from "@/components/site/SiteNav";
import { imageUrl, initials } from "@/lib/images";
import { ordinal } from "@/lib/dates";
import { getAllCarverSlugs, getCarverBySlug, getEventContext } from "@/lib/queries";
import { SOCIAL_LABEL, socialLabel, socialUrl, type Social } from "@/lib/social";

export async function generateStaticParams() {
  const slugs = await getAllCarverSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const carver = await getCarverBySlug(slug);
  if (!carver) return { title: "Carver not found" };

  const where = carver.hometown ? ` of ${carver.hometown}` : "";
  return {
    title: carver.name,
    description:
      carver.card_line ??
      `${carver.name}${where} competes in the ${carver.division} division at the Oregon Divisional Chainsaw Carving Championship.`,
    alternates: { canonical: `/carvers/${carver.slug}` },
    openGraph: {
      title: carver.name,
      description: carver.card_line ?? undefined,
      url: `/carvers/${carver.slug}`,
      ...(carver.photo_path ? { images: [{ url: imageUrl(carver.photo_path)! }] } : {}),
    },
  };
}

const SOCIALS: Social[] = ["facebook", "instagram", "tiktok"];

export default async function CarverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [carver, ctx] = await Promise.all([getCarverBySlug(slug), getEventContext()]);
  if (!carver) notFound();

  const photo = imageUrl(carver.photo_path);
  const appearances = carver.years
    .filter((y) => y.status !== "Not attending")
    .map((y) => y.year)
    .sort((a, b) => b - a);
  const thisYear = carver.years.find((y) => y.year === ctx.year);

  return (
    <>
      <SiteNav dateLabel={ctx.rangeLabel} passesHref={ctx.passesHref} active="carvers" />

      <main id="main" className="px-6 pb-8 pt-10 md:px-16 md:pt-14">
        <Link
          href="/carvers"
          className="mb-8 inline-flex min-h-11 items-center text-[15px] font-bold text-gold no-underline hover:underline"
        >
          ← All carvers
        </Link>

        <article className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <div className="relative aspect-3/4 w-full max-w-[420px]">
            {photo ? (
              <Image
                src={photo}
                alt={carver.photo_alt ?? `Sculpture by ${carver.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                className="border-2 border-line object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line bg-fir-850">
                <span aria-hidden="true" className="display text-[96px] font-black text-placeholder">
                  {initials(carver.name)}
                </span>
                <span className="text-[12px] uppercase tracking-[1.5px] text-sub">
                  Photo coming
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="eyebrow">
                {carver.division} division
                {thisYear ? ` · ${ctx.year} ${thisYear.status.toLowerCase()}` : ""}
              </div>
              <h1 className="display m-0 text-(length:--text-page-h1) font-black leading-[0.85]">
                {carver.name}
              </h1>
              {carver.hometown && (
                <p className="m-0 text-(length:--text-subtitle) font-bold text-gold">
                  {carver.hometown}
                </p>
              )}
            </div>

            {carver.honor_badge && (
              <span className="self-start bg-gold px-3 py-2 text-[13px] font-bold uppercase tracking-[1.5px] text-brown">
                {carver.honor_badge}
              </span>
            )}

            {carver.bio ? (
              <div className="flex flex-col gap-4">
                {carver.bio.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className="m-0 text-[19px] leading-[1.6] text-body">
                    {para}
                  </p>
                ))}
              </div>
            ) : carver.card_line ? (
              <p className="m-0 text-[19px] leading-[1.6] text-body">{carver.card_line}</p>
            ) : null}

            <dl className="m-0 grid grid-cols-1 gap-x-10 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
              {carver.studio && <Detail label="Studio">{carver.studio}</Detail>}
              {carver.country && <Detail label="Country">{carver.country}</Detail>}
              {carver.website && (
                <Detail label="Website">
                  <a
                    href={carver.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-gold no-underline hover:underline"
                  >
                    {carver.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </Detail>
              )}
              {SOCIALS.map((platform) => {
                const value = carver[platform];
                if (!value) return null;
                const href = socialUrl(platform, value);
                return (
                  <Detail key={platform} label={SOCIAL_LABEL[platform]}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-gold no-underline hover:underline"
                      >
                        {socialLabel(value)}
                      </a>
                    ) : (
                      socialLabel(value)
                    )}
                  </Detail>
                );
              })}
              {appearances.length > 0 && (
                <Detail label="At the championship">
                  {appearances.length === 1
                    ? appearances[0]
                    : `${appearances.length} years — ${appearances.join(", ")}`}
                </Detail>
              )}
            </dl>

            {carver.honors.length > 0 && (
              <section className="flex flex-col gap-3 border-t border-line pt-6">
                <h2 className="display m-0 text-[28px] font-black">Honors</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {carver.honors.map((honor) => (
                    <li key={honor.id} className="flex gap-3 text-[17px] text-body">
                      <span className="display shrink-0 font-black text-gold">{honor.year}</span>
                      <span>
                        {ordinal(honor.place)} place, {honor.division} division
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </main>

      <NewsletterBand source={`/carvers/${carver.slug}`} />
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[12px] font-bold uppercase tracking-[2px] text-sub">{label}</dt>
      <dd className="m-0 text-[17px] text-cream">{children}</dd>
    </div>
  );
}
