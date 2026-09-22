-- The carver PDF's fourth page is a small vendor application of its own for
-- the optional carvings-only selling space. The first cut captured the space
-- count and fee; this adds the rest of that page — whether they'll sell
-- anything besides carvings, how they intend to pay, and the signature line.
alter table public.carver_applications
  add column if not exists sells_other_items boolean not null default false,
  add column if not exists selling_payment_method text
    check (selling_payment_method is null or selling_payment_method in ('check','card','cash')),
  add column if not exists selling_check_number text,
  add column if not exists selling_signature_name text,
  add column if not exists selling_signed_at timestamptz;

comment on column public.carver_applications.selling_payment_method is
  'check = mailed check/money order; card = will call the Chamber (3% fee); cash = on arrival, by arrangement';
