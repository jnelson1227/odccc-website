import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth session cookie on admin routes so a signed-in
 * volunteer is not logged out mid-edit. Public pages don't need a session, so
 * the matcher keeps this off the hot path for ordinary visitors.
 */
export default async function proxy(request: NextRequest) {
  // Leave the sign-in callback alone. Calling getUser() here would refresh and
  // rewrite the auth cookies before the route handler has had a chance to trade
  // the one-time code for a session, and the exchange needs the verifier cookie
  // exactly as the browser set it. Refreshing a session that doesn't exist yet
  // is pointless anyway.
  if (request.nextUrl.pathname === "/admin/auth/callback") {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
