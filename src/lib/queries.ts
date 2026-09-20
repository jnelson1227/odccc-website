import { unstable_cache } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { TAGS } from "@/lib/cache";
import {
  editionLabel,
  formatRange,
  resolveEventDates,
  roundedCarverCount,
  type EventRange,
} from "@/lib/dates";
import type {
  Carver,
  CarverStatus,
  CarverWithStatus,
  ScheduleItem,
  Settings,
  Sponsor,
  SponsorshipLevel,
  Winner,
} from "@/lib/types";

/** Carvers who count as "in the lineup" for a year. */
const IN_LINEUP: CarverStatus[] = ["Confirmed", "Invited"];

/**
 * Wrap a fetcher in Next's data cache under a tag, so an admin save that calls
 * revalidateTag(tag) drops it. Every public query goes through this.
 */
function cached<T>(key: string, tag: string, fn: () => Promise<T>) {
  return unstable_cache(fn, [key], { tags: [tag] });
}

/** Throw on a real Postgres error; an empty table is not an error. */
function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`Failed to load ${what}: ${res.error.message}`);
  return res.data as T;
}

// ---------------------------------------------------------------- settings

export const getSettings = cached("settings", TAGS.settings, async (): Promise<Settings> => {
  const res = await publicClient.from("settings").select("*").eq("id", 1).single();
  return unwrap(res, "settings");
});

/**
 * Everything a page needs about "this year's championship": the settings row
 * plus the dates, edition and labels derived from it. Dates are never stored —
 * see docs/04-data-model.md.
 */
export type EventContext = {
  settings: Settings;
  year: number;
  dates: EventRange;
  /** "June 17–20, 2027" */
  rangeLabel: string;
  /** "27th annual" */
  editionLabel: string;
  /** Where "Get Passes" points: the ticket link if set, otherwise /visit#passes. */
  passesHref: string;
};

export async function getEventContext(): Promise<EventContext> {
  const settings = await getSettings();
  const year = settings.event_year;
  const dates = resolveEventDates(year, settings.date_override_start, settings.date_override_end);

  return {
    settings,
    year,
    dates,
    rangeLabel: formatRange(dates),
    editionLabel: editionLabel(year),
    passesHref: settings.ticket_url?.trim() ? settings.ticket_url.trim() : "/visit#passes",
  };
}

// ---------------------------------------------------------------- carvers

const carversForYear = (year: number) =>
  cached(`carvers-${year}`, TAGS.carvers, async (): Promise<CarverWithStatus[]> => {
    const res = await publicClient
      .from("carver_years")
      .select("status, carvers!inner(*)")
      .eq("year", year)
      .in("status", IN_LINEUP);

    const rows = unwrap(res, "carvers") as unknown as {
      status: CarverStatus;
      carvers: Carver;
    }[];

    return rows
      .map(({ status, carvers }) => ({ ...carvers, status }))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  })();

/**
 * The carvers to show on /carvers. When `carvers_page_mode` is "previous" the
 * next lineup hasn't been announced yet, so last year's field is shown instead
 * under its own heading.
 */
export async function getLineup(): Promise<{
  year: number;
  isPrevious: boolean;
  pro: CarverWithStatus[];
  semiPro: CarverWithStatus[];
  total: number;
}> {
  const { settings, year } = await getEventContext();
  const isPrevious = settings.carvers_page_mode === "previous";
  const lineupYear = isPrevious ? year - 1 : year;
  const all = await carversForYear(lineupYear);

  return {
    year: lineupYear,
    isPrevious,
    pro: all.filter((c) => c.division === "Pro"),
    semiPro: all.filter((c) => c.division === "Semi-Pro"),
    total: all.length,
  };
}

/** The "See all 30+ carvers" figure on the homepage. */
export async function getCarverCountLabel(): Promise<string> {
  const { year } = await getEventContext();
  const all = await carversForYear(year);
  return roundedCarverCount(all.length);
}

/** The six admin-chosen cards in "Meet the carvers", in the admin's order. */
export async function getFeaturedCarvers(): Promise<Carver[]> {
  const { settings } = await getEventContext();
  const ids = settings.featured_carver_ids ?? [];
  if (ids.length === 0) return [];

  const carvers = await cached(
    `featured-${ids.join(",")}`,
    TAGS.carvers,
    async (): Promise<Carver[]> => {
      const res = await publicClient.from("carvers").select("*").in("id", ids);
      return unwrap(res, "featured carvers");
    },
  )();

  // Preserve the order the admin dragged them into.
  const byId = new Map(carvers.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter((c): c is Carver => Boolean(c));
}

export const getAllCarverSlugs = cached(
  "carver-slugs",
  TAGS.carvers,
  async (): Promise<string[]> => {
    const res = await publicClient.from("carvers").select("slug");
    return unwrap(res, "carver slugs").map((r: { slug: string }) => r.slug);
  },
);

export async function getCarverBySlug(slug: string): Promise<
  | (Carver & {
      years: { year: number; status: CarverStatus }[];
      honors: Winner[];
    })
  | null
> {
  return cached(`carver-${slug}`, TAGS.carvers, async () => {
    const res = await publicClient.from("carvers").select("*").eq("slug", slug).maybeSingle();
    if (res.error) throw new Error(`Failed to load carver: ${res.error.message}`);
    const carver = res.data as Carver | null;
    if (!carver) return null;

    const [yearsRes, winsRes] = await Promise.all([
      publicClient
        .from("carver_years")
        .select("year, status")
        .eq("carver_id", carver.id)
        .order("year", { ascending: false }),
      publicClient
        .from("winners")
        .select("*")
        .eq("carver_id", carver.id)
        .order("year", { ascending: false }),
    ]);

    return {
      ...carver,
      years: (yearsRes.data ?? []) as { year: number; status: CarverStatus }[],
      honors: (winsRes.data ?? []) as Winner[],
    };
  })();
}

// ---------------------------------------------------------------- sponsors

export const getSponsorshipLevels = cached(
  "levels",
  TAGS.levels,
  async (): Promise<SponsorshipLevel[]> => {
    const res = await publicClient
      .from("sponsorship_levels")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    return unwrap(res, "sponsorship levels");
  },
);

const sponsorsForYear = (year: number) =>
  cached(`sponsors-${year}`, TAGS.sponsors, async (): Promise<Sponsor[]> => {
    const res = await publicClient
      .from("sponsors")
      .select("*")
      .eq("year", year)
      .order("sort_order");
    return unwrap(res, "sponsors");
  })();

export type SponsorGroup = {
  /** The level name, or the legacy 2026 level for sponsors booked before the rework. */
  label: string;
  showLogo: boolean;
  sponsors: Sponsor[];
};

/**
 * Sponsors for the Sponsors page, grouped by level in display order. When the
 * current year has none yet, last year's are shown with a thank-you instead.
 */
export async function getSponsorsByLevel(): Promise<{
  year: number;
  isPrevious: boolean;
  groups: SponsorGroup[];
  presenting: Sponsor | null;
}> {
  const { settings, year } = await getEventContext();
  const levels = await getSponsorshipLevels();

  let sponsorYear = year;
  let sponsors = await sponsorsForYear(year);
  const isPrevious = sponsors.length === 0;
  if (isPrevious) {
    sponsorYear = year - 1;
    sponsors = await sponsorsForYear(sponsorYear);
  }

  const presenting =
    settings.presenting_enabled && settings.presenting_sponsor_id
      ? (sponsors.find((s) => s.id === settings.presenting_sponsor_id) ?? null)
      : null;

  const groups: SponsorGroup[] = [];

  // Levels first, in the admin's display order.
  for (const level of levels) {
    const inLevel = sponsors.filter((s) => s.level_id === level.id && s.id !== presenting?.id);
    if (inLevel.length > 0) {
      groups.push({ label: level.name, showLogo: level.show_logo, sponsors: inLevel });
    }
  }

  // Then anything still carrying a 2026-era legacy level, in the order it was seeded.
  const legacyOrder: string[] = [];
  for (const s of sponsors) {
    if (s.level_id || s.id === presenting?.id || !s.legacy_level) continue;
    if (!legacyOrder.includes(s.legacy_level)) legacyOrder.push(s.legacy_level);
  }
  for (const label of legacyOrder) {
    groups.push({
      label,
      // Legacy tiers were name-only; the 2026 mockup shows Title/Gold/Silver as
      // tiles and Bronze/Community as name lists.
      showLogo: ["Title", "Gold", "Silver"].includes(label),
      sponsors: sponsors.filter((s) => !s.level_id && s.legacy_level === label),
    });
  }

  // Finally, sponsors with neither a level nor a legacy label.
  const unsorted = sponsors.filter((s) => !s.level_id && !s.legacy_level && s.id !== presenting?.id);
  if (unsorted.length > 0) {
    groups.push({ label: "Sponsors", showLogo: false, sponsors: unsorted });
  }

  return { year: sponsorYear, isPrevious, groups, presenting };
}

/**
 * How many of each level are taken this year, so /sponsorship can say
 * "1 available", "Open" or "Sold".
 */
export async function getLevelAvailability(): Promise<Map<string, number>> {
  const { year } = await getEventContext();
  const sponsors = await sponsorsForYear(year);
  const taken = new Map<string, number>();
  for (const s of sponsors) {
    if (!s.level_id) continue;
    taken.set(s.level_id, (taken.get(s.level_id) ?? 0) + 1);
  }
  return taken;
}

export function availabilityLabel(level: SponsorshipLevel, taken: number): string {
  if (level.max_available == null) return "Open";
  const left = level.max_available - taken;
  if (left <= 0) return "Sold";
  return `${left} available`;
}

// ---------------------------------------------------------------- schedule

export const getScheduleItems = cached(
  "schedule",
  TAGS.schedule,
  async (): Promise<ScheduleItem[]> => {
    const res = await publicClient.from("schedule_items").select("*").order("sort_order");
    return unwrap(res, "schedule");
  },
);

// ---------------------------------------------------------------- winners

export const getWinners = cached("winners", TAGS.winners, async (): Promise<Winner[]> => {
  const res = await publicClient
    .from("winners")
    .select("*")
    .order("year", { ascending: false })
    .order("division")
    .order("place");
  return unwrap(res, "winners");
});

export type WinnerRow = {
  year: number;
  division: string;
  first: string | null;
  second: string | null;
  third: string | null;
};

/** Winners folded into one row per year + division, newest first. */
export async function getWinnerRows(): Promise<WinnerRow[]> {
  const winners = await getWinners();
  const rows = new Map<string, WinnerRow>();

  for (const w of winners) {
    const key = `${w.year}|${w.division}`;
    const row = rows.get(key) ?? {
      year: w.year,
      division: w.division,
      first: null,
      second: null,
      third: null,
    };
    if (w.place === 1) row.first = w.carver_name;
    if (w.place === 2) row.second = w.carver_name;
    if (w.place === 3) row.third = w.carver_name;
    rows.set(key, row);
  }

  const divisionRank: Record<string, number> = { Pro: 0, "Semi-Pro": 1, "Quick Carve": 2, Other: 3 };
  return [...rows.values()].sort(
    (a, b) => b.year - a.year || (divisionRank[a.division] ?? 9) - (divisionRank[b.division] ?? 9),
  );
}
