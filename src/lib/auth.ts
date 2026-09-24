import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types";

export type SignedInAdmin = {
  email: string;
  role: AdminRole;
};

/**
 * The gate for every admin page and every admin server action.
 *
 * Two checks, not one. A Supabase session only proves someone owns an email
 * address — and this project's auth pool is shared with the Visit Reedsport
 * app, so plenty of people can get a valid session. Being an ODCCC admin means
 * being on the `admins` allowlist, which is also what RLS enforces in the
 * database.
 *
 * Not signed in → the login page. Signed in but not on the list → signed out
 * with an explanation, rather than a bare "forbidden".
 */
export async function requireAdmin(): Promise<SignedInAdmin> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("email, role")
    .eq("email", user.email)
    .maybeSingle();

  if (!admin) {
    // Local only. This person may be a legitimate Visit Reedsport user, and a
    // global sign-out would end their session in that app as well.
    await supabase.auth.signOut({ scope: "local" });
    redirect(`/admin/login?denied=${encodeURIComponent(user.email)}`);
  }

  return { email: admin.email as string, role: admin.role as AdminRole };
}

/** Screens only an owner may open — currently just the Admins list. */
export async function requireOwner(): Promise<SignedInAdmin> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin/event?error=owner-only");
  return admin;
}
