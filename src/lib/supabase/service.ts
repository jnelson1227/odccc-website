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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return null;

  // A key is a JWT: ASCII only. Copying it by selecting the text rather than
  // using the dashboard's copy button can drag in a line-wrap arrow or a
  // non-breaking space, and the only symptom is an unreadable TypeError from
  // deep inside fetch ("Cannot convert argument to a ByteString...") because
  // HTTP headers can't carry non-Latin-1 characters. Say what's actually wrong.
  const bad = [...key].find((c) => c.charCodeAt(0) > 126 || c.charCodeAt(0) < 32);
  if (bad) {
    console.error(
      `SUPABASE_SERVICE_ROLE_KEY contains a character that can't go in a request header: ` +
        `${JSON.stringify(bad)} (U+${bad.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}) ` +
        `at index ${[...key].indexOf(bad)}. Re-copy the key with the dashboard's copy button.`,
    );
    return null;
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
