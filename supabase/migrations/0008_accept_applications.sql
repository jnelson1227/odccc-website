-- Accepting a carver application turns it into (or updates) a carver profile.
--
-- carvers.gallery holds the work photos that came with the application, each
-- with its alt text — the portrait and the competition carving stay in their
-- own columns. The application remembers which carver it became, so accepting
-- twice updates rather than duplicates, and so the committee can see who is
-- already in the lineup.
alter table public.carvers
  add column if not exists gallery jsonb not null default '[]'::jsonb;

comment on column public.carvers.gallery is
  'Array of {path, alt} — extra work photos shown on the carver''s page';

alter table public.carver_applications
  add column if not exists carver_id uuid references public.carvers(id) on delete set null,
  add column if not exists accepted_at timestamptz;

create index if not exists carver_applications_carver_id_idx
  on public.carver_applications (carver_id);
