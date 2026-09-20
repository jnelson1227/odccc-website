import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Carver, Settings, Sponsor, SponsorshipLevel } from "@/lib/types";
import EventForm from "./EventForm";

export const dynamic = "force-dynamic";

export default async function EventAdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();
  const typed = settings as Settings;

  const [{ data: carvers }, { data: levels }] = await Promise.all([
    supabase.from("carvers").select("*").order("name"),
    supabase.from("sponsorship_levels").select("*").order("sort_order").limit(1),
  ]);

  // "Presenting" is whichever level sorts first, so renaming it doesn't break this.
  const presentingLevel = (levels as SponsorshipLevel[] | null)?.[0];
  const { data: sponsors } = presentingLevel
    ? await supabase
        .from("sponsors")
        .select("*")
        .eq("year", typed.event_year)
        .eq("level_id", presentingLevel.id)
        .order("name")
    : { data: [] };

  return (
    <AdminShell admin={admin} title="Event & homepage" lastSaved={typed.updated_at}>
      <EventForm
        settings={typed}
        carvers={(carvers ?? []) as Carver[]}
        presentingCandidates={(sponsors ?? []) as Sponsor[]}
      />
    </AdminShell>
  );
}
