import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Carver, CarverApplication, Settings, VendorApplication } from "@/lib/types";
import ApplicationsManager from "./ApplicationsManager";

export const dynamic = "force-dynamic";

/**
 * Both kinds of application on one screen, switched by ?type=. The current
 * year's come first; older years stay reachable through the year filter so
 * last year's vendors can be looked up when they ask for the same spot.
 */
export default async function ApplicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { type } = await searchParams;
  const kind = type === "vendor" ? "vendor" : "carver";

  const [settingsRes, carversRes, vendorsRes, profilesRes] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase
      .from("carver_applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("vendor_applications")
      .select("*")
      .order("created_at", { ascending: false }),
    // Every carver profile, for matching applications against the roster.
    supabase.from("carvers").select("*").order("name"),
  ]);

  const settings = settingsRes.data as Settings;

  return (
    <AdminShell admin={admin} title="Applications">
      <ApplicationsManager
        kind={kind}
        year={settings.event_year}
        open={{
          carver: settings.carver_applications_open,
          vendor: settings.vendor_applications_open,
        }}
        carvers={(carversRes.data ?? []) as CarverApplication[]}
        vendors={(vendorsRes.data ?? []) as VendorApplication[]}
        profiles={(profilesRes.data ?? []) as Carver[]}
      />
    </AdminShell>
  );
}
