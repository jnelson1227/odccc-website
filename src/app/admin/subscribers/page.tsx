import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { countRecentSignups } from "@/lib/subscribers";
import type { Subscriber } from "@/lib/types";
import SubscribersTable from "./SubscribersTable";

export const dynamic = "force-dynamic";

export default async function SubscribersAdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const subscribers = (data ?? []) as Subscriber[];

  return (
    <AdminShell admin={admin} title="Subscribers">
      <SubscribersTable subscribers={subscribers} recentCount={countRecentSignups(subscribers)} />
    </AdminShell>
  );
}
