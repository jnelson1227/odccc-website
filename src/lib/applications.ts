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
  Carver,
  QuickCarveComfort,
  SellingPaymentMethod,
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

/** The three ways the carver form lets a selling space be paid for. */
export const SELLING_PAYMENT_METHODS: { value: SellingPaymentMethod; label: string }[] = [
  { value: "check", label: "Check or money order, by mail" },
  { value: "card", label: "Card — I'll call the Chamber (3% processing fee)" },
  { value: "cash", label: "Cash when I arrive, arranged with the Chamber ahead of time" },
];

export function paymentMethodLabel(method: SellingPaymentMethod | null): string {
  if (!method) return "—";
  return SELLING_PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

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

// ---------------------------------------------------------------- accepting

/** The fields of a carver profile the match list needs to show. */
export type CarverSummary = Pick<Carver, "id" | "name" | "slug" | "hometown" | "division">;

export type CarverMatch = {
  carver: CarverSummary;
  reason: "same name" | "same last name";
};

const normalise = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Carvers an application might already be. A returning carver usually types
 * their name the way it's already on the site, so an exact name match comes
 * first; the same surname is offered next for "Bob King" vs "Robert King".
 * Nothing is linked automatically — the committee confirms the match.
 */
export function matchCarvers(
  application: { first_name: string; last_name: string },
  carvers: CarverSummary[],
): CarverMatch[] {
  const full = normalise(`${application.first_name} ${application.last_name}`);
  const last = normalise(application.last_name);
  if (!last) return [];

  const matches: CarverMatch[] = [];
  for (const carver of carvers) {
    const name = normalise(carver.name);
    if (name === full) {
      matches.push({ carver, reason: "same name" });
    } else if (name.split(" ").pop() === last) {
      matches.push({ carver, reason: "same last name" });
    }
  }
  return matches.sort((a, b) =>
    a.reason === b.reason ? a.carver.name.localeCompare(b.carver.name, "en") : a.reason === "same name" ? -1 : 1,
  );
}

/** "Reedsport, OR" — the way carver hometowns read on the site. */
export function hometownFrom(app: { city: string; state: string }): string {
  return [app.city.trim(), app.state.trim()].filter(Boolean).join(", ");
}

/** 275 → "$275". Fees are always whole dollars on these forms. */
export const money = (amount: number): string => `$${amount.toLocaleString("en-US")}`;
