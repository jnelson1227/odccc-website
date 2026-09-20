import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components — used for magic-link sign in/out. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
