import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Carver, Settings, Winner } from "@/lib/types";
import WinnersEditor from "./WinnersEditor";

export const dynamic = "force-dynamic";

export default async function WinnersAdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const [{ data: winners }, { data: carvers }, { data: settings }] = await Promise.all([
    supabase
      .from("winners")
      .select("*")
      .order("year", { ascending: false })
      .order("division")
      .order("place"),
    supabase.from("carvers").select("*").order("name"),
    supabase.from("settings").select("event_year").eq("id", 1).single(),
  ]);

  return (
    <AdminShell admin={admin} title="Past winners">
      <WinnersEditor
        winners={(winners ?? []) as Winner[]}
        carvers={(carvers ?? []) as Carver[]}
        currentYear={(settings as Settings)?.event_year ?? new Date().getUTCFullYear()}
      />
    </AdminShell>
  );
}
