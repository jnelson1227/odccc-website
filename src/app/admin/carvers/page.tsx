import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Carver, CarverStatus, Settings } from "@/lib/types";
import CarversManager, { type CarverRow } from "./CarversManager";

export const dynamic = "force-dynamic";

export default async function CarversAdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("settings")
    .select("event_year, featured_carver_ids, updated_at")
    .eq("id", 1)
    .single();

  const year = (settings as Settings)?.event_year ?? new Date().getUTCFullYear();
  const featured = new Set<string>((settings as Settings)?.featured_carver_ids ?? []);

  const [{ data: carvers }, { data: statuses }] = await Promise.all([
    supabase.from("carvers").select("*").order("name"),
    supabase.from("carver_years").select("carver_id, status").eq("year", year),
  ]);

  const statusByCarver = new Map<string, CarverStatus>(
    (statuses ?? []).map((row) => [row.carver_id as string, row.status as CarverStatus]),
  );

  const rows: CarverRow[] = ((carvers ?? []) as Carver[]).map((carver) => ({
    id: carver.id,
    name: carver.name,
    hometown: carver.hometown,
    country: carver.country,
    division: carver.division,
    studio: carver.studio,
    website: carver.website,
    facebook: carver.facebook,
    instagram: carver.instagram,
    tiktok: carver.tiktok,
    card_line: carver.card_line,
    bio: carver.bio,
    honor_badge: carver.honor_badge,
    photo_path: carver.photo_path,
    photo_alt: carver.photo_alt,
    portrait_path: carver.portrait_path,
    portrait_alt: carver.portrait_alt,
    status: statusByCarver.get(carver.id) ?? null,
    featured: featured.has(carver.id),
  }));

  return (
    <AdminShell admin={admin} title="Carvers" lastSaved={(settings as Settings)?.updated_at}>
      <CarversManager carvers={rows} year={year} />
    </AdminShell>
  );
}
