import Link from "next/link";
import type { Metadata } from "next";
import EventJsonLd from "@/components/site/EventJsonLd";
import NewsletterBand from "@/components/site/NewsletterBand";
import PageHeader from "@/components/site/PageHeader";
import SiteNav from "@/components/site/SiteNav";
import { eventDays, formatDayShort } from "@/lib/dates";
import { getEventContext, getScheduleItems } from "@/lib/queries";
import type { ScheduleItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Schedule",
  description:
    "Four days of carving at Rainbow Plaza: daily Quick Carve at 10:30, live auctions every evening, and Sunday's judging and awards.",
  alternates: { canonical: "/schedule" },
};

const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });

export default async function SchedulePage() {
  const ctx = await getEventContext();
  const items = await getScheduleItems();
  const days = eventDays(ctx.dates);

  const weekday = items.filter((i) => i.day_type === "weekday");
  const sunday = items.filter((i) => i.day_type === "sunday");

  return (
    <>
      <EventJsonLd ctx={ctx} />
      <SiteNav dateLabel={ctx.rangeLabel} passesHref={ctx.passesHref} active="schedule" />
      <PageHeader
        image="/images/site/header-schedule.jpg"
        eyebrow={`Father's Day weekend · ${ctx.rangeLabel}`}
        title="Schedule"
        intro="Four days, same rhythm: carving from 7:30 every morning, a 90-minute Quick Carve at 10:30, and a live auction to close the day. Sunday ends with judging and the awards."
      />

      <main id="main">
        <section className="grid grid-cols-1 gap-6 px-6 pb-10 pt-12 md:px-16 md:pt-16 lg:grid-cols-2">
          {days.map((day) => {
            const isSunday = day.getUTCDay() === 0;
            return (
              <DayCard
                key={day.toISOString()}
                name={WEEKDAY.format(day)}
                date={formatDayShort(day)}
                items={isSunday ? sunday : weekday}
              />
            );
          })}
        </section>

        <section
          id="passes"
          className="grid grid-cols-1 gap-6 px-6 pb-20 md:px-16 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-[10px] border border-line p-8">
            <div className="eyebrow">Daily admission</div>
            <div className="display text-(length:--text-stat) font-black leading-none">
              {ctx.settings.admission_daily ?? "—"}
            </div>
            <p className="m-0 text-[15px] text-body">Good for one day, all day.</p>
          </div>

          <div className="flex flex-col gap-[10px] border-2 border-gold p-8">
            <div className="eyebrow">4-day pass · best value</div>
            <div className="display text-(length:--text-stat) font-black leading-none">
              {ctx.settings.admission_pass ?? "—"}
            </div>
            <p className="m-0 text-[15px] text-body">
              Watch a sculpture go from log to finished piece.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4 border border-line p-8">
            <p className="m-0 text-[18px] leading-[1.5] text-body">
              <strong className="text-cream">Rainbow Plaza, Reedsport.</strong> Gates open daily at{" "}
              {ctx.settings.gate_open_time ?? "8:00 a.m."} Food and vendors on site all four days.
            </p>
            {ctx.settings.ticket_url?.trim() ? (
              <a
                href={ctx.settings.ticket_url.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex min-h-11 items-center self-start"
              >
                Buy passes
              </a>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <Link href="/visit" className="btn-gold flex min-h-11 items-center">
                  Plan your visit
                </Link>
                <a
                  href="#updates"
                  className="inline-flex min-h-11 items-center text-[15px] font-bold text-gold underline underline-offset-4"
                >
                  Sign up for updates
                </a>
              </div>
            )}
          </div>
        </section>

        <NewsletterBand source="/schedule" />
      </main>
    </>
  );
}

function DayCard({
  name,
  date,
  items,
}: {
  name: string;
  date: string;
  items: ScheduleItem[];
}) {
  return (
    <div className="flex flex-col gap-[18px] border border-line bg-fir-850 p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="display m-0 text-(length:--text-day-h3) font-black leading-none">{name}</h2>
        <span className="text-[14px] font-bold uppercase tracking-[2px] text-gold">{date}</span>
      </div>

      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid grid-cols-1 gap-2 border-t border-line py-4 sm:grid-cols-[170px_1fr] sm:gap-5 ${
              item.highlight ? "-mx-4 bg-gold/8 px-4" : ""
            }`}
          >
            <span
              className={`display text-[20px] font-bold leading-tight sm:text-[22px] ${
                item.highlight ? "text-gold" : "text-cream"
              }`}
            >
              {item.time_label}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[17px] font-bold">{item.title}</span>
              {item.description && (
                <span className="text-[15px] text-body">{item.description}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
