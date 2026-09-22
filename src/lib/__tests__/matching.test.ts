import { describe, expect, it } from "vitest";
import { hometownFrom, matchCarvers } from "../applications";

const roster = [
  { id: "1", name: "Bob King", slug: "bob-king", hometown: "Edgewood, WA", division: "Pro" as const },
  { id: "2", name: "Colby Herrington", slug: "colby-herrington", hometown: null, division: "Pro" as const },
  { id: "3", name: "Katrina Dressler", slug: "katrina-dressler", hometown: null, division: "Semi-Pro" as const },
  { id: "4", name: "Ryan Anderson", slug: "ryan-anderson", hometown: "Coos Bay, OR", division: "Pro" as const },
];

describe("matchCarvers", () => {
  it("puts an exact name match first", () => {
    const matches = matchCarvers({ first_name: "Bob", last_name: "King" }, roster);
    expect(matches[0]).toMatchObject({ carver: { id: "1" }, reason: "same name" });
  });

  it("ignores case, accents and punctuation in names", () => {
    const matches = matchCarvers({ first_name: "colby ", last_name: "HERRINGTON" }, roster);
    expect(matches.map((m) => m.carver.id)).toEqual(["2"]);
    expect(matches[0].reason).toBe("same name");
  });

  it("offers the same surname as a weaker match", () => {
    const matches = matchCarvers({ first_name: "Robert", last_name: "King" }, roster);
    expect(matches).toEqual([{ carver: roster[0], reason: "same last name" }]);
  });

  it("returns nothing for a new name", () => {
    expect(matchCarvers({ first_name: "Jarrod", last_name: "Flowers" }, roster)).toEqual([]);
  });

  it("never matches on an empty surname", () => {
    expect(matchCarvers({ first_name: "Bob", last_name: "  " }, roster)).toEqual([]);
  });
});

describe("hometownFrom", () => {
  it("reads like the site's hometowns", () => {
    expect(hometownFrom({ city: "Reedsport", state: "OR" })).toBe("Reedsport, OR");
    expect(hometownFrom({ city: "  Bandon ", state: "" })).toBe("Bandon");
  });
});
