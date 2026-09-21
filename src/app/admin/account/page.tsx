import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import AccountForm from "./AccountForm";

export const dynamic = "force-dynamic";

export default async function AccountAdminPage() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin} title="Your account">
      <AccountForm email={admin.email} />
    </AdminShell>
  );
}
