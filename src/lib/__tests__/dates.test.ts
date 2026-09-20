import { describe, expect, it } from "vitest";
import {
  edition,
  editionLabel,
  eventDates,
  eventDays,
  fathersDay,
  formatDayShort,
  formatRange,
  formatRangeLong,
  ordinal,
  parseISODate,
  resolveEventDates,
  roundedCarverCount,
  toISODate,
} from "../dates";

const iso = (d: Date) => toISODate(d);

describe("fathersDay", () => {
  it("is the 3rd Sunday of June", () => {
    expect(iso(fathersDay(2026))).toBe("2026-06-21");
    expect(iso(fathersDay(2027))).toBe("2027-06-20");
    expect(iso(fathersDay(2028))).toBe("2028-06-18");
  });

  it("always lands on a Sunday", () => {
    for (let y = 2000; y <= 2060; y++) {
      expect(fathersDay(y).getUTCDay()).toBe(0);
    }
  });

  it("always falls between June 15 and June 21", () => {
    for (let y = 2000; y <= 2060; y++) {
      const d = fathersDay(y).getUTCDate();
      expect(d).toBeGreaterThanOrEqual(15);
      expect(d).toBeLessThanOrEqual(21);
    }
  });

  it("handles a June that opens on a Sunday", () => {
    // June 1, 2025 was a Sunday, so the 3rd Sunday is the 15th.
    expect(iso(fathersDay(2025))).toBe("2025-06-15");
  });
});

describe("eventDates", () => {
  it("matches the known editions", () => {
    // 2026 is the event that just happened — this is the regression anchor.
    expect(iso(eventDates(2026).start)).toBe("2026-06-18");
    expect(iso(eventDates(2026).end)).toBe("2026-06-21");
    expect(iso(eventDates(2027).start)).toBe("2027-06-17");
    expect(iso(eventDates(2027).end)).toBe("2027-06-20");
    expect(iso(eventDates(2028).start)).toBe("2028-06-15");
    expect(iso(eventDates(2028).end)).toBe("2028-06-18");
  });

  it("runs Thursday through Sunday", () => {
    for (let y = 2000; y <= 2060; y++) {
      const { start, end } = eventDates(y);
      expect(start.getUTCDay()).toBe(4); // Thursday
      expect(end.getUTCDay()).toBe(0); // Sunday
      expect((end.getTime() - start.getTime()) / 86_400_000).toBe(3);
    }
  });

  it("never spills out of June", () => {
    for (let y = 2000; y <= 2060; y++) {
      const { start, end } = eventDates(y);
      expect(start.getUTCMonth()).toBe(5);
      expect(end.getUTCMonth()).toBe(5);
    }
  });
});

describe("edition", () => {
  it("counts from 2000", () => {
    expect(edition(2027)).toBe(27);
    expect(edition(2000)).toBe(0);
  });

  it("labels editions with the right ordinal suffix", () => {
    expect(editionLabel(2021)).toBe("21st annual");
    expect(editionLabel(2022)).toBe("22nd annual");
    expect(editionLabel(2023)).toBe("23rd annual");
    expect(editionLabel(2026)).toBe("26th annual");
    expect(editionLabel(2027)).toBe("27th annual");
    expect(editionLabel(2031)).toBe("31st annual");
  });
});

describe("ordinal", () => {
  it("uses st/nd/rd/th", () => {
    expect(["1st", "2nd", "3rd", "4th"]).toEqual([1, 2, 3, 4].map(ordinal));
  });

  it("treats 11, 12 and 13 as -th", () => {
    expect([11, 12, 13].map(ordinal)).toEqual(["11th", "12th", "13th"]);
  });

  it("keeps working past 100", () => {
    expect([111, 112, 113, 121].map(ordinal)).toEqual(["111th", "112th", "113th", "121st"]);
  });
});

describe("resolveEventDates", () => {
  it("computes from the year by default", () => {
    expect(iso(resolveEventDates(2027).start)).toBe("2027-06-17");
  });

  it("ignores a half-filled override", () => {
    expect(iso(resolveEventDates(2027, "2027-07-01", null).start)).toBe("2027-06-17");
    expect(iso(resolveEventDates(2027, null, "2027-07-04").end)).toBe("2027-06-20");
  });

  it("honours a complete override", () => {
    const r = resolveEventDates(2027, "2027-07-01", "2027-07-04");
    expect(iso(r.start)).toBe("2027-07-01");
    expect(iso(r.end)).toBe("2027-07-04");
  });

  it("falls back when an override date is malformed", () => {
    expect(iso(resolveEventDates(2027, "July 1st", "2027-07-04").start)).toBe("2027-06-17");
  });
});

describe("formatting", () => {
  it("writes a same-month range with an en dash", () => {
    expect(formatRange(eventDates(2027))).toBe("June 17–20, 2027");
    expect(formatRange(eventDates(2026))).toBe("June 18–21, 2026");
  });

  it("spells out both months when an override crosses one", () => {
    expect(formatRange(resolveEventDates(2027, "2027-05-30", "2027-06-02"))).toBe(
      "May 30 – June 2, 2027",
    );
  });

  it("writes the long form used in the admin's locked box", () => {
    expect(formatRangeLong(eventDates(2027))).toBe(
      "Thursday, June 17 – Sunday, June 20, 2027",
    );
  });

  it("writes a single day for schedule cards", () => {
    expect(formatDayShort(eventDates(2027).start)).toBe("June 17");
  });
});

describe("eventDays", () => {
  it("returns the four days in order", () => {
    expect(eventDays(eventDates(2027)).map(iso)).toEqual([
      "2027-06-17",
      "2027-06-18",
      "2027-06-19",
      "2027-06-20",
    ]);
  });
});

describe("parseISODate", () => {
  it("rejects anything that isn't YYYY-MM-DD", () => {
    expect(parseISODate("2027-6-1")).toBeNull();
    expect(parseISODate("")).toBeNull();
    expect(parseISODate("nope")).toBeNull();
  });
});

describe("roundedCarverCount", () => {
  it("rounds down to a multiple of 5 and adds a +", () => {
    expect(roundedCarverCount(39)).toBe("35+");
    expect(roundedCarverCount(34)).toBe("30+");
    expect(roundedCarverCount(30)).toBe("30+");
  });

  it("shows the exact count when there is nothing to round to", () => {
    expect(roundedCarverCount(0)).toBe("0");
    expect(roundedCarverCount(4)).toBe("4");
  });
});
