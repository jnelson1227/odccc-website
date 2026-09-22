import { describe, expect, it } from "vitest";
import { applicationHref, carverSellingFee, money, vendorFee } from "../applications";

/** The 2026 schedule printed on the vendor PDF. */
const RATES = {
  vendor_fee_food: 175,
  vendor_fee_food_member: 150,
  vendor_fee_other: 150,
  vendor_fee_other_member: 125,
  vendor_fee_additional_space: 150,
  vendor_fee_electrical: 40,
};

describe("vendorFee", () => {
  it("charges the first space at the booth-type rate", () => {
    expect(vendorFee(RATES, { boothType: "Food", chamberMember: false, spaces: 1, electrical: false }).total).toBe(175);
    expect(vendorFee(RATES, { boothType: "Craft", chamberMember: false, spaces: 1, electrical: false }).total).toBe(150);
  });

  it("gives Chamber members the lower rate", () => {
    expect(vendorFee(RATES, { boothType: "Food", chamberMember: true, spaces: 1, electrical: false }).total).toBe(150);
    expect(vendorFee(RATES, { boothType: "Non-Profit", chamberMember: true, spaces: 1, electrical: false }).total).toBe(125);
  });

  it("charges every space after the first at the flat additional rate", () => {
    const fee = vendorFee(RATES, { boothType: "Commercial", chamberMember: false, spaces: 3, electrical: false });
    expect(fee.baseRate).toBe(150);
    expect(fee.additional).toBe(300);
    expect(fee.total).toBe(450);
  });

  it("bills electricity per space, for food vendors only", () => {
    const food = vendorFee(RATES, { boothType: "Food", chamberMember: false, spaces: 2, electrical: true });
    expect(food.electrical).toBe(80);
    expect(food.total).toBe(175 + 150 + 80);

    // A craft booth ticking the box is not charged — the schedule says food only.
    const craft = vendorFee(RATES, { boothType: "Craft", chamberMember: false, spaces: 2, electrical: true });
    expect(craft.electrical).toBe(0);
    expect(craft.total).toBe(300);
  });

  it("never charges for fewer than one space", () => {
    expect(vendorFee(RATES, { boothType: "Craft", chamberMember: false, spaces: 0, electrical: false }).total).toBe(150);
    expect(vendorFee(RATES, { boothType: "Craft", chamberMember: false, spaces: Number.NaN, electrical: false }).total).toBe(150);
  });
});

describe("carverSellingFee", () => {
  it("is a flat rate per space", () => {
    expect(carverSellingFee(100, 1)).toBe(100);
    expect(carverSellingFee(100, 3)).toBe(300);
    expect(carverSellingFee(100, 0)).toBe(0);
  });
});

describe("applicationHref", () => {
  it("defaults to the site's own forms", () => {
    const settings = { carver_application_url: null, vendor_application_url: null };
    expect(applicationHref(settings, "carver")).toBe("/apply/carver");
    expect(applicationHref(settings, "vendor")).toBe("/apply/vendor");
  });

  it("lets an outside link in settings take over", () => {
    const settings = { carver_application_url: "https://example.com/form", vendor_application_url: "  " };
    expect(applicationHref(settings, "carver")).toBe("https://example.com/form");
    expect(applicationHref(settings, "vendor")).toBe("/apply/vendor");
  });
});

describe("money", () => {
  it("formats whole dollars", () => {
    expect(money(175)).toBe("$175");
    expect(money(1250)).toBe("$1,250");
  });
});
