/**
 * Event dates are never stored by hand — they are computed from the year.
 *
 *   Father's Day = the 3rd Sunday of June.
 *   The championship runs Thursday–Sunday, ending on Father's Day.
 *   Edition = year − 2000 (2027 → "27th annual").
 *
 * `settings.date_override_start` / `date_override_end` exist for emergencies
 * only; when both are set they win. See docs/04-data-model.md.
 *
 * Everything here works in UTC so the result never shifts with the viewer's
 * timezone — a date rendered on a phone in Tokyo must read the same as one
 * rendered on the server in Oregon.
 */

/** The 3rd Sunday of June for a given year. */
export function fathersDay(year: number): Date {
  const june1 = new Date(Date.UTC(year, 5, 1));
  const firstSunday = 1 + ((7 - june1.getUTCDay()) % 7);
  return new Date(Date.UTC(year, 5, firstSunday + 14));
}

/** Thursday–Sunday, ending on Father's Day. */
export function eventDates(year: number): { start: Date; end: Date } {
  const end = fathersDay(year);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 3);
  return { start, end };
}

/** 2027 → 27. */
export const edition = (year: number): number => year - 2000;

/** 1 → "1st", 22 → "22nd", 23 → "23rd", 27 → "27th", 111 → "111th". */
export function ordinal(n: number): string {
  const abs = Math.abs(n);
  const lastTwo = abs % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13
      ? "th"
      : abs % 10 === 1
        ? "st"
        : abs % 10 === 2
          ? "nd"
          : abs % 10 === 3
            ? "rd"
            : "th";
  return `${n}${suffix}`;
}

/** 2027 → "27th annual". */
export const editionLabel = (year: number): string => `${ordinal(edition(year))} annual`;

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });

const month = (d: Date) => MONTH.format(d);
const weekday = (d: Date) => WEEKDAY.format(d);
const day = (d: Date) => d.getUTCDate();

export type EventRange = { start: Date; end: Date };

/**
 * Resolve the dates for a year, honouring a settings override when both
 * override dates are present.
 */
export function resolveEventDates(
  year: number,
  overrideStart?: string | null,
  overrideEnd?: string | null,
): EventRange {
  if (overrideStart && overrideEnd) {
    const start = parseISODate(overrideStart);
    const end = parseISODate(overrideEnd);
    if (start && end) return { start, end };
  }
  return eventDates(year);
}

/** "2027-06-17" → a UTC Date. Returns null for anything unparseable. */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** A Date → "2027-06-17", for date inputs. */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "June 17–20, 2027" — the nav and eyebrow format. Uses an en dash. */
export function formatRange({ start, end }: EventRange): string {
  const year = end.getUTCFullYear();
  if (month(start) === month(end) && start.getUTCFullYear() === year) {
    return `${month(start)} ${day(start)}–${day(end)}, ${year}`;
  }
  return `${month(start)} ${day(start)} – ${month(end)} ${day(end)}, ${year}`;
}

/** "Thursday, June 17 – Sunday, June 20, 2027" — the admin's locked date box. */
export function formatRangeLong({ start, end }: EventRange): string {
  return `${weekday(start)}, ${month(start)} ${day(start)} – ${weekday(end)}, ${month(end)} ${day(end)}, ${end.getUTCFullYear()}`;
}

/** "June 17" — the date on a schedule day card. */
export function formatDayShort(d: Date): string {
  return `${month(d)} ${day(d)}`;
}

/** The four days of the event, in order. */
export function eventDays({ start, end }: EventRange): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/** ISO 8601 with the event's local timezone offset, for schema.org Event JSON-LD. */
export function isoWithPacificOffset(d: Date, time: "start" | "end"): string {
  // Reedsport is on Pacific Daylight Time (UTC−7) in June, every year.
  return `${toISODate(d)}T${time === "start" ? "08:00:00" : "18:00:00"}-07:00`;
}

/**
 * The "30+ carvers" figure on the homepage: the count of carvers confirmed or
 * invited for the year, rounded down to a multiple of 5, with a "+".
 * Under 5 carvers there is nothing meaningful to round to, so show the count.
 */
export function roundedCarverCount(count: number): string {
  if (count < 5) return String(count);
  return `${Math.floor(count / 5) * 5}+`;
}
