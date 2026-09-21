-- ODCCC website: initial schema
--
-- NOTE ON THE SHARED PROJECT
-- This runs inside the existing "reedsport-chamber" Supabase project, alongside
-- the Visit Reedsport app's tables. None of the ODCCC table names collide, so
-- they keep the names from docs/04-data-model.md. Two things are namespaced to
-- keep the two apps from ever stepping on each other:
--   * the RLS helpers are odccc_is_admin() / odccc_is_owner(), not the very
--     generic is_admin() — a later `create or replace function is_admin()` from
--     the other app would otherwise silently rewrite ODCCC's access rules;
--   * the storage bucket is "odccc-media", to sit unambiguously next to the
--     Chamber app's "place-photos".
--
-- Public site reads with the anon key (RLS: select only on public tables).
-- Admin writes use an authenticated session whose email is in public.admins.

create extension if not exists citext;

-- ---------- Admins ----------
create table public.admins (
  email citext primary key,
  role text not null default 'editor' check (role in ('owner','editor')),
  created_at timestamptz not null default now()
);

create or replace function public.odccc_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.email = (auth.jwt() ->> 'email'));
$$;

create or replace function public.odccc_is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.email = (auth.jwt() ->> 'email') and a.role = 'owner');
$$;

-- ---------- Settings (single row) ----------
create table public.settings (
  id int primary key default 1 check (id = 1),
  event_year int not null default 2027,
  date_override_start date,
  date_override_end date,
  admission_daily text default '$10',
  admission_pass text default '$30',
  ticket_url text,
  gate_open_time text default '8:00 a.m.',
  hero_line1 text default 'Four days.',
  hero_line2 text default '80 tons',
  hero_line3 text default 'of logs.',
  hero_para1 text,
  hero_para2 text,
  hero_bg_path text default '/images/site/hero-bg.jpg',
  hero_wash numeric(3,2) default 0.80,
  presenting_enabled boolean not null default false,
  presenting_sponsor_id uuid,
  featured_carver_ids uuid[] default '{}',
  contact_phone text default '541-271-3495',
  contact_text text default '541-662-2154',
  contact_email text default 'reedsportchamberofcommerce@gmail.com',
  contact_address text default '2741 Frontage Road, Reedsport, OR 97467',
  parking_copy text,
  visit_reedsport_url text,
  carver_application_url text,
  vendor_application_url text,
  sponsorship_form_path text,
  stat_visitors text default '4,000+',
  carvers_page_mode text not null default 'current' check (carvers_page_mode in ('current','previous')),
  updated_at timestamptz not null default now()
);

-- ---------- Carvers ----------
create table public.carvers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  hometown text,
  country text default 'USA',
  division text not null check (division in ('Pro','Semi-Pro')),
  studio text,
  website text,
  card_line text check (char_length(card_line) <= 80),
  bio text,
  honor_badge text,
  photo_path text,
  photo_alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carver_years (
  carver_id uuid references public.carvers(id) on delete cascade,
  year int not null,
  status text not null default 'Invited' check (status in ('Confirmed','Invited','Not attending')),
  primary key (carver_id, year)
);

-- ---------- Sponsorship ----------
create table public.sponsorship_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_label text not null,            -- "$10,000", "$1,000+"
  price_amount int,                     -- for sorting/reporting
  max_available int,                    -- null = open
  benefits text[] not null default '{}',
  show_logo boolean not null default false,
  on_poster boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  name text not null,
  level_id uuid references public.sponsorship_levels(id) on delete set null,
  legacy_level text,                    -- e.g. 2026 "Gold" before the new level structure
  status text not null default 'Pledged' check (status in ('Pledged','Paid')),
  logo_path text,
  website text,
  in_kind_note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.settings add constraint settings_presenting_fk foreign key (presenting_sponsor_id) references public.sponsors(id) on delete set null;

-- ---------- Schedule ----------
create table public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  day_type text not null check (day_type in ('weekday','sunday')),
  time_label text not null,
  title text not null,
  description text,
  highlight boolean not null default false,
  sort_order int not null default 0
);

-- ---------- Winners ----------
create table public.winners (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  division text not null check (division in ('Pro','Semi-Pro','Quick Carve','Other')),
  place int not null check (place between 1 and 10),
  carver_name text not null,
  carver_id uuid references public.carvers(id) on delete set null,
  unique (year, division, place)
);

-- ---------- Newsletter ----------
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  first_name text,
  source text,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- ---------- Media library ----------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  alt text not null,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.admins enable row level security;
alter table public.settings enable row level security;
alter table public.carvers enable row level security;
alter table public.carver_years enable row level security;
alter table public.sponsorship_levels enable row level security;
alter table public.sponsors enable row level security;
alter table public.schedule_items enable row level security;
alter table public.winners enable row level security;
alter table public.subscribers enable row level security;
alter table public.media enable row level security;

-- public read
create policy "public read" on public.settings for select using (true);
create policy "public read" on public.carvers for select using (true);
create policy "public read" on public.carver_years for select using (true);
create policy "public read" on public.sponsorship_levels for select using (active or public.odccc_is_admin());
create policy "public read" on public.sponsors for select using (true);
create policy "public read" on public.schedule_items for select using (true);
create policy "public read" on public.winners for select using (true);
create policy "public read" on public.media for select using (true);

-- admin write
create policy "admin write" on public.settings for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.carvers for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.carver_years for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.sponsorship_levels for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.sponsors for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.schedule_items for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.winners for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());
create policy "admin write" on public.media for all using (public.odccc_is_admin()) with check (public.odccc_is_admin());

-- subscribers: nobody reads publicly; inserts happen in a server action with the service role
-- (validation, honeypot, rate limit). Admins can read/update/delete.
create policy "admin read" on public.subscribers for select using (public.odccc_is_admin());
create policy "admin update" on public.subscribers for update using (public.odccc_is_admin());
create policy "admin delete" on public.subscribers for delete using (public.odccc_is_admin());

-- admins table: admins can see the list; only owners change it
create policy "admin read" on public.admins for select using (public.odccc_is_admin());
create policy "owner write" on public.admins for all using (public.odccc_is_owner()) with check (public.odccc_is_owner());

-- ---------- Storage ----------
insert into storage.buckets (id, name, public) values ('odccc-media','odccc-media', true) on conflict do nothing;
create policy "odccc public read media" on storage.objects for select using (bucket_id = 'odccc-media');
create policy "odccc admin write media" on storage.objects for insert with check (bucket_id = 'odccc-media' and public.odccc_is_admin());
create policy "odccc admin update media" on storage.objects for update using (bucket_id = 'odccc-media' and public.odccc_is_admin());
create policy "odccc admin delete media" on storage.objects for delete using (bucket_id = 'odccc-media' and public.odccc_is_admin());

-- ---------- keep updated_at honest ----------
create or replace function public.odccc_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger odccc_settings_touch before update on public.settings
  for each row execute function public.odccc_touch_updated_at();
create trigger odccc_carvers_touch before update on public.carvers
  for each row execute function public.odccc_touch_updated_at();
