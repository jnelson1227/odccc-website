-- Carver and vendor applications, taken online instead of on the PDF forms the
-- Chamber has mailed out until now (2026 Chainsaw Carver Application.pdf and
-- 2026 Chainsaw Vendor Application.pdf). The fields below follow those forms
-- question for question so a printed application and an online one can sit
-- side by side in the same review.
--
-- Nobody reads these tables publicly: they hold home addresses and phone
-- numbers. Inserts happen in a server action with the service role, after
-- validation, a honeypot and a rate limit — the same shape as `subscribers`.

-- ---------- Fees and switches the Chamber controls ----------
-- The fee schedule changes year to year, so it is content, not code. Defaults
-- are the 2026 numbers from the two PDFs.
alter table public.settings
  add column if not exists carver_applications_open boolean not null default false,
  add column if not exists vendor_applications_open boolean not null default false,
  add column if not exists application_deadline text,
  add column if not exists carver_selling_space_fee int not null default 100,
  add column if not exists vendor_fee_food int not null default 175,
  add column if not exists vendor_fee_food_member int not null default 150,
  add column if not exists vendor_fee_other int not null default 150,
  add column if not exists vendor_fee_other_member int not null default 125,
  add column if not exists vendor_fee_additional_space int not null default 150,
  add column if not exists vendor_fee_electrical int not null default 40;

comment on column public.settings.application_deadline is
  'Free text, e.g. "May 8, 2026". Shown on both application forms.';

-- ---------- Carver applications ----------
create table if not exists public.carver_applications (
  id uuid primary key default gen_random_uuid(),
  year int not null,

  -- Contact information
  first_name text not null,
  last_name text not null,
  street_address text not null,
  city text not null,
  state text not null,
  zip text not null,
  phone text not null,
  email citext not null,
  text_ok boolean not null default false,

  -- Event information
  division text not null check (division in ('Pro','Semi-Pro')),
  shirt_size text not null check (shirt_size in ('Small','Med','Lrg','XL','2XL','3XL','4XL')),
  quick_carve_comfort text not null check (quick_carve_comfort in ('Very','Somewhat','Not at all')),
  experience text not null,

  -- Announcement bio, used on Facebook and this site if the carver is selected
  bio text,
  public_contact text,

  -- "at least two photos of your work", in the odccc-media bucket
  photo_paths text[] not null default '{}',

  -- Carver selling space (page 4 of the carver PDF) — carvings only
  wants_selling_space boolean not null default false,
  selling_business_name text,
  selling_spaces int check (selling_spaces is null or selling_spaces between 1 and 10),
  selling_other_items text,
  selling_fee_total int,

  status text not null default 'New'
    check (status in ('New','Reviewed','Accepted','Waitlisted','Declined')),
  admin_notes text,
  created_at timestamptz not null default now()
);

-- ---------- Vendor applications ----------
create table if not exists public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  year int not null,

  business_name text not null,
  first_name text not null,
  last_name text not null,
  street_address text not null,
  city text not null,
  state text not null,
  zip text not null,
  phone text not null,
  fax text,
  email citext not null,
  website text,

  booth_type text not null
    check (booth_type in ('Food','Craft','Collectible','Commercial','Non-Profit')),
  chamber_member boolean not null default false,
  -- "ONLY ITEMS LISTED BELOW WILL BE ALLOWED TO BE SOLD"
  items_for_sale text not null,

  electrical boolean not null default false,
  electrical_needs text,
  spaces int not null default 1 check (spaces between 1 and 20),
  fee_total int not null default 0,
  -- "Participants desiring to be near each other should indicate this fact"
  near_vendor text,

  -- Douglas County workers' compensation certificate (ORS 656), parts 2 and 3
  workers_comp text not null check (workers_comp in ('no-employees','has-employees')),

  -- The pages the PDF says must come back signed
  agrees_terms boolean not null default false,
  agrees_code_of_conduct boolean not null default false,
  agrees_waiver boolean not null default false,
  signature_name text not null,
  signed_at timestamptz not null default now(),

  status text not null default 'New'
    check (status in ('New','Reviewed','Accepted','Waitlisted','Declined')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create index if not exists carver_applications_year_created_idx
  on public.carver_applications (year, created_at desc);
create index if not exists vendor_applications_year_created_idx
  on public.vendor_applications (year, created_at desc);

-- ---------- RLS ----------
-- No public select policy at all: an application holds a home address. Only
-- admins read them, and only the service role writes them.
alter table public.carver_applications enable row level security;
alter table public.vendor_applications enable row level security;

do $$
declare t text;
begin
  foreach t in array array['carver_applications','vendor_applications'] loop
    execute format(
      'create policy "admin read" on public.%I for select using (public.odccc_is_admin())', t);
    execute format(
      'create policy "admin update" on public.%I for update using (public.odccc_is_admin()) with check (public.odccc_is_admin())', t);
    execute format(
      'create policy "admin delete" on public.%I for delete using (public.odccc_is_admin())', t);
  end loop;
end $$;
