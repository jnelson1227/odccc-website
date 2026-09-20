import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only anon client with no cookie access, used by every public page.
 *
 * Deliberately cookie-free: reading cookies would opt each page into dynamic
 * rendering, and these pages need to be prerendered for SEO and speed. Freshness
 * comes from `revalidatePath` / `revalidateTag` when an admin saves instead.
 */
export const publicClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
