/**
 * Row types for the ODCCC tables. Hand-written rather than generated, because
 * this Supabase project is shared with the Visit Reedsport app and a generated
 * Database type would carry 29 tables that have nothing to do with this site.
 */

export type Division = "Pro" | "Semi-Pro";
export type CarverStatus = "Confirmed" | "Invited" | "Not attending";
export type SponsorStatus = "Pledged" | "Paid";
export type SubscriberStatus = "subscribed" | "unsubscribed";
export type AdminRole = "owner" | "editor";
export type DayType = "weekday" | "sunday";
export type CarversPageMode = "current" | "previous";
export type ApplicationStatus = "New" | "Reviewed" | "Accepted" | "Waitlisted" | "Declined";
export type BoothType = "Food" | "Craft" | "Collectible" | "Commercial" | "Non-Profit";
export type ShirtSize = "Small" | "Med" | "Lrg" | "XL" | "2XL" | "3XL" | "4XL";
export type QuickCarveComfort = "Very" | "Somewhat" | "Not at all";
export type WorkersComp = "no-employees" | "has-employees";
/** How a carver intends to pay for a selling space, per the printed form. */
export type SellingPaymentMethod = "check" | "card" | "cash";

export type Settings = {
  id: number;
  event_year: number;
  date_override_start: string | null;
  date_override_end: string | null;
  admission_daily: string | null;
  admission_pass: string | null;
  ticket_url: string | null;
  gate_open_time: string | null;
  hero_line1: string | null;
  hero_line2: string | null;
  hero_line3: string | null;
  hero_para1: string | null;
  hero_para2: string | null;
  hero_bg_path: string | null;
  hero_wash: number | null;
  presenting_enabled: boolean;
  presenting_sponsor_id: string | null;
  featured_carver_ids: string[] | null;
  contact_phone: string | null;
  contact_text: string | null;
  contact_email: string | null;
  contact_address: string | null;
  parking_copy: string | null;
  visit_reedsport_url: string | null;
  carver_application_url: string | null;
  vendor_application_url: string | null;
  sponsorship_form_path: string | null;
  stat_visitors: string | null;
  carvers_page_mode: CarversPageMode;
  /** Applications are closed until the Chamber opens them in the admin. */
  carver_applications_open: boolean;
  vendor_applications_open: boolean;
  /** Free text, e.g. "May 8, 2026". */
  application_deadline: string | null;
  /** Whole dollars. The 2026 fee schedule from the two application PDFs. */
  carver_selling_space_fee: number;
  vendor_fee_food: number;
  vendor_fee_food_member: number;
  vendor_fee_other: number;
  vendor_fee_other_member: number;
  vendor_fee_additional_space: number;
  vendor_fee_electrical: number;
  updated_at: string;
};

export type Carver = {
  id: string;
  slug: string;
  name: string;
  hometown: string | null;
  country: string | null;
  division: Division;
  studio: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  card_line: string | null;
  bio: string | null;
  honor_badge: string | null;
  /** The sculpture the carver competed with. */
  photo_path: string | null;
  photo_alt: string | null;
  /** The photo of the carver themselves, as they submitted it. */
  portrait_path: string | null;
  portrait_alt: string | null;
  created_at: string;
  updated_at: string;
};

export type CarverYear = {
  carver_id: string;
  year: number;
  status: CarverStatus;
};

/** A carver joined to their status for one year. */
export type CarverWithStatus = Carver & { status: CarverStatus };

export type SponsorshipLevel = {
  id: string;
  name: string;
  price_label: string;
  price_amount: number | null;
  max_available: number | null;
  benefits: string[];
  show_logo: boolean;
  on_poster: boolean;
  sort_order: number;
  active: boolean;
};

export type Sponsor = {
  id: string;
  year: number;
  name: string;
  level_id: string | null;
  legacy_level: string | null;
  status: SponsorStatus;
  logo_path: string | null;
  website: string | null;
  in_kind_note: string | null;
  sort_order: number;
  created_at: string;
};

export type ScheduleItem = {
  id: string;
  day_type: DayType;
  time_label: string;
  title: string;
  description: string | null;
  highlight: boolean;
  sort_order: number;
};

export type Winner = {
  id: string;
  year: number;
  division: "Pro" | "Semi-Pro" | "Quick Carve" | "Other";
  place: number;
  carver_name: string;
  carver_id: string | null;
};

export type Subscriber = {
  id: string;
  email: string;
  first_name: string | null;
  source: string | null;
  status: SubscriberStatus;
  unsubscribe_token: string;
  created_at: string;
};

export type MediaItem = {
  id: string;
  path: string;
  alt: string;
  created_at: string;
};

export type Admin = {
  email: string;
  role: AdminRole;
  created_at: string;
};

/**
 * A carver's application to compete, following the Chamber's printed form.
 * `photo_paths` are keys in the `odccc-media` bucket — the "at least two
 * photos of your work" the form asks for.
 */
export type CarverApplication = {
  id: string;
  year: number;
  first_name: string;
  last_name: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  text_ok: boolean;
  division: Division;
  shirt_size: ShirtSize;
  quick_carve_comfort: QuickCarveComfort;
  experience: string;
  bio: string | null;
  /** Published with the bio if selected — same shape as the carver profile's. */
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  photo_paths: string[];
  /** The optional 10'x12' space for selling finished carvings, carvings only. */
  wants_selling_space: boolean;
  selling_business_name: string | null;
  selling_spaces: number | null;
  /** "Are you planning to sell any items other than carvings?" */
  sells_other_items: boolean;
  selling_other_items: string | null;
  selling_fee_total: number | null;
  selling_payment_method: SellingPaymentMethod | null;
  selling_check_number: string | null;
  /** The "Authorized Signature" line, typed. */
  selling_signature_name: string | null;
  selling_signed_at: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
};

/** A vendor's application for booth space, following the Chamber's printed form. */
export type VendorApplication = {
  id: string;
  year: number;
  business_name: string;
  first_name: string;
  last_name: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string | null;
  email: string;
  website: string | null;
  booth_type: BoothType;
  chamber_member: boolean;
  items_for_sale: string;
  electrical: boolean;
  electrical_needs: string | null;
  spaces: number;
  fee_total: number;
  near_vendor: string | null;
  workers_comp: WorkersComp;
  agrees_terms: boolean;
  agrees_code_of_conduct: boolean;
  agrees_waiver: boolean;
  signature_name: string;
  signed_at: string;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
};
