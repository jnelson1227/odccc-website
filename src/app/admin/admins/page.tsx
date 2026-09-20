import AdminShell from "@/components/admin/AdminShell";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Admin } from "@/lib/types";
import AdminsEditor from "./AdminsEditor";

export const dynamic = "force-dynamic";

export default async function AdminsAdminPage() {
  const owner = await requireOwner();
  const supabase = await createClient();

  const { data } = await supabase.from("admins").select("*").order("created_at");

  return (
    <AdminShell admin={owner} title="Admins">
      <AdminsEditor admins={(data ?? []) as Admin[]} currentEmail={owner.email} />
    </AdminShell>
  );
}
