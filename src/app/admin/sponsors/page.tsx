import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Settings, Sponsor, SponsorshipLevel } from "@/lib/types";
import SponsorsManager from "./SponsorsManager";

export const dynamic = "force-dynamic";

export default async function SponsorsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { year: yearParam } = await searchParams;

  const { data: settingsRow } = await supabase.from("settings").select("*").eq("id", 1).single();
  const settings = settingsRow as Settings;

  const requested = Number.parseInt(yearParam ?? "", 10);
  const year = Number.isFinite(requested) ? requested : settings.event_year;

  const [{ data: levels }, { data: sponsors }] = await Promise.all([
    supabase.from("sponsorship_levels").select("*").eq("active", true).order("sort_order"),
    supabase.from("sponsors").select("*").eq("year", year).order("sort_order"),
  ]);

  // Offer every year that has sponsors, plus the current and next event year.
  const { data: allYears } = await supabase.from("sponsors").select("year");
  const years = [
    ...new Set([
      ...(allYears ?? []).map((r) => r.year as number),
      settings.event_year,
      settings.event_year + 1,
    ]),
  ].sort((a, b) => b - a);

  return (
    <AdminShell admin={admin} title="Sponsors" lastSaved={settings.updated_at}>
      <SponsorsManager
        levels={(levels ?? []) as SponsorshipLevel[]}
        sponsors={(sponsors ?? []) as Sponsor[]}
        settings={settings}
        year={year}
        years={years}
      />
    </AdminShell>
  );
}
