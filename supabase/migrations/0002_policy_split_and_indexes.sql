-- Applied after 0001, in response to the Supabase database linter.
--
-- 1. "admin write" was a FOR ALL policy, which includes SELECT. That left two
--    permissive SELECT policies on every content table, so each public page
--    read also evaluated odccc_is_admin() — a lookup against public.admins on
--    the path that matters most for SEO. Splitting it into INSERT / UPDATE /
--    DELETE leaves exactly one SELECT policy per table.
--
--    Admins lose nothing: "public read" is `using (true)` everywhere except
--    sponsorship_levels, which already carries its own `or odccc_is_admin()`
--    so admins can still see inactive levels.
--
-- 2. Covering indexes for the foreign keys, plus the two composite indexes the
--    site's own queries need.

do $$
declare t text;
begin
  foreach t in array array[
    'settings','carvers','carver_years','sponsorship_levels',
    'sponsors','schedule_items','winners','media'
  ] loop
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format(
      'create policy "admin insert" on public.%I for insert with check (public.odccc_is_admin())', t);
    execute format(
      'create policy "admin update" on public.%I for update using (public.odccc_is_admin()) with check (public.odccc_is_admin())', t);
    execute format(
      'create policy "admin delete" on public.%I for delete using (public.odccc_is_admin())', t);
  end loop;
end $$;

-- Same overlap on the admins table: "owner write" was FOR ALL alongside
-- "admin read".
drop policy if exists "owner write" on public.admins;
create policy "owner insert" on public.admins for insert with check (public.odccc_is_owner());
create policy "owner update" on public.admins for update using (public.odccc_is_owner()) with check (public.odccc_is_owner());
create policy "owner delete" on public.admins for delete using (public.odccc_is_owner());

-- Foreign keys without a covering index.
create index if not exists settings_presenting_sponsor_id_idx on public.settings (presenting_sponsor_id);
create index if not exists sponsors_level_id_idx on public.sponsors (level_id);
create index if not exists winners_carver_id_idx on public.winners (carver_id);

-- The lookups the site actually makes: the lineup for a year, sponsors for a year.
create index if not exists carver_years_year_status_idx on public.carver_years (year, status);
create index if not exists sponsors_year_sort_idx on public.sponsors (year, sort_order);

-- Pin the trigger function's search_path (database linter 0011).
create or replace function public.odccc_touch_updated_at() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
