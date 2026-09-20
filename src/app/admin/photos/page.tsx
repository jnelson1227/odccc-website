import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { MediaItem } from "@/lib/types";
import PhotoLibrary from "./PhotoLibrary";

export const dynamic = "force-dynamic";

export default async function PhotosAdminPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminShell admin={admin} title="Photos">
      <PhotoLibrary media={(data ?? []) as MediaItem[]} />
    </AdminShell>
  );
}
