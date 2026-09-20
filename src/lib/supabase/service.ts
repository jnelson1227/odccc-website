import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS, so it is used in exactly one place: the
 * newsletter server action, which inserts into `subscribers` (a table with no
 * public insert policy) after validating input, checking a honeypot and
 * rate-limiting by IP.
 *
 * Returns null when the key is not configured, so the rest of the site still
 * builds and runs without it.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
