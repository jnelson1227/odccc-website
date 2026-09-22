/**
 * The shared vocabulary of the two application forms, and the fee arithmetic
 * behind them.
 *
 * The option lists are the ones printed on the Chamber's PDFs, kept in one
 * place so the public form, the admin table and the CSV export can never drift
 * apart from each other or from the database's CHECK constraints.
 *
 * Fee rates are not in here: they live in `settings`, because the Chamber
 * changes them between years and shouldn't need a deploy to do it.
 */

import type {
  ApplicationStatus,
  BoothType,
  QuickCarveComfort,
  Settings,
  ShirtSize,
  WorkersComp,
} from "@/lib/types";

/**
 * Where "apply" buttons point. The site has its own forms, so the default is
 * the internal page; an outside link pasted into settings overrides it — the
 * escape hatch if the Chamber ever moves applications to another service.
 */
export function applicationHref(
  settings: Pick<Settings, "carver_application_url" | "vendor_application_url">,
  kind: "carver" | "vendor",
): string {
  const outside =
    kind === "carver" ? settings.carver_application_url : settings.vendor_application_url;
  return outside?.trim() || `/apply/${kind}`;
}

export const DIVISIONS = ["Pro", "Semi-Pro"] as const;

export const SHIRT_SIZES: ShirtSize[] = ["Small", "Med", "Lrg", "XL", "2XL", "3XL", "4XL"];

export const QUICK_CARVE_COMFORT: QuickCarveComfort[] = ["Very", "Somewhat", "Not at all"];

export const BOOTH_TYPES: BoothType[] = [
  "Food",
  "Craft",
  "Collectible",
  "Commercial",
  "Non-Profit",
];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "New",
  "Reviewed",
  "Accepted",
  "Waitlisted",
  "Declined",
];

export const WORKERS_COMP_OPTIONS: { value: WorkersComp; label: string }[] = [
  {
    value: "no-employees",
    label: "I will NOT employ workers to perform labor at this event",
  },
  {
    value: "has-employees",
    label: "Subject workers WILL be employed to perform labor at this event",
  },
];

/**
 * Only food vendors pay for electricity, and only food vendors are required to
 * carry liability insurance — both PDFs are emphatic about it, so the form
 * keys off this in two places.
 */
export const isFoodBooth = (type: BoothType | null | undefined): boolean => type === "Food";

/** At least two photos of your work, says the form. Six is plenty. */
export const MIN_CARVER_PHOTOS = 2;
export const MAX_CARVER_PHOTOS = 6;

/** Applicant uploads are namespaced so they never mingle with site media. */
export const APPLICATION_PHOTO_FOLDER = "applications/carvers";

/** The subset of settings the fee maths needs, so callers can pass a literal. */
export type FeeRates = {
  vendor_fee_food: number;
  vendor_fee_food_member: number;
  vendor_fee_other: number;
  vendor_fee_other_member: number;
  vendor_fee_additional_space: number;
  vendor_fee_electrical: number;
};

export type VendorFee = {
  /** What the first space costs, at the applicant's member and booth rate. */
  baseRate: number;
  additional: number;
  electrical: number;
  total: number;
};

/**
 * The vendor fee schedule from the PDF: the first space is charged at the
 * member/non-member rate for that booth type, every space after it is the flat
 * "additional space" rate, and electricity is per space for food vendors only.
 */
export function vendorFee(
  rates: FeeRates,
  {
    boothType,
    chamberMember,
    spaces,
    electrical,
  }: {
    boothType: BoothType;
    chamberMember: boolean;
    spaces: number;
    electrical: boolean;
  },
): VendorFee {
  const count = Math.max(1, Math.floor(spaces) || 1);
  const food = isFoodBooth(boothType);

  const baseRate = food
    ? chamberMember
      ? rates.vendor_fee_food_member
      : rates.vendor_fee_food
    : chamberMember
      ? rates.vendor_fee_other_member
      : rates.vendor_fee_other;

  const additional = (count - 1) * rates.vendor_fee_additional_space;
  // "Per Plug In $40 each (FOOD VENDORS ONLY)" — charged per space taken.
  const power = food && electrical ? count * rates.vendor_fee_electrical : 0;

  return {
    baseRate,
    additional,
    electrical: power,
    total: baseRate + additional + power,
  };
}

/** A carver's optional selling space: a flat rate per 10'x12' space. */
export function carverSellingFee(ratePerSpace: number, spaces: number): number {
  const count = Math.max(0, Math.floor(spaces) || 0);
  return count * ratePerSpace;
}

/** 275 → "$275". Fees are always whole dollars on these forms. */
export const money = (amount: number): string => `$${amount.toLocaleString("en-US")}`;
