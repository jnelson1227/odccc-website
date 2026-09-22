-- One "contact info" box didn't let anything link. Split it into the same
-- three fields a carver profile carries, so an accepted carver's links copy
-- straight across and the admin can click them. No applications exist yet, so
-- the old column goes rather than lingering empty.
alter table public.carver_applications
  add column if not exists website text,
  add column if not exists facebook text,
  add column if not exists instagram text,
  drop column if exists public_contact;
