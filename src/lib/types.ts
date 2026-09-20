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
  card_line: string | null;
  bio: string | null;
  honor_badge: string | null;
  photo_path: string | null;
  photo_alt: string | null;
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
