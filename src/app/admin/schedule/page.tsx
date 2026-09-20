import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ScheduleItem } from "@/lib/types";
import ScheduleEditor from "./ScheduleEditor";

export const dynamic = "force-dynamic";

export default async function ScheduleAdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase.from("schedule_items").select("*").order("sort_order");

  return (
    <AdminShell admin={admin} title="Schedule">
      <ScheduleEditor items={(data ?? []) as ScheduleItem[]} />
    </AdminShell>
  );
}
