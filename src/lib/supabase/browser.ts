import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components — used for magic-link sign in/out. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * For the emailed sign-in link only. The default (PKCE) link can only be
 * finished by the browser that asked for it, because it needs a cookie written
 * at request time. Phones break that constantly: Gmail and Mail open links in
 * their own built-in browser, and a link asked for on a laptop gets opened on
 * a phone. An implicit-flow link carries the session itself, so it works
 * wherever it's opened. `/admin/auth/finish` picks it up.
 *
 * Not a singleton: the shared browser client is PKCE, and asking for a cached
 * client would hand that one back.
 */
export function createLinkClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: false, auth: { flowType: "implicit", detectSessionInUrl: false } },
  );
}
