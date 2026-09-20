import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where the magic link lands. Trades the one-time code for a session cookie,
 * then sends the volunteer to the admin. The allowlist check happens in
 * requireAdmin(), so an email that isn't an admin gets signed straight back
 * out with an explanation.
 *
 * Supabase can also send us here with its own error instead of a code — an
 * expired or already-consumed link, usually because a mail scanner fetched it
 * first. Those get their own message rather than being reported as a missing
 * code, which told nobody anything.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const supabaseError = searchParams.get("error_code") ?? searchParams.get("error");
  const next = searchParams.get("next") ?? "/admin/event";

  if (supabaseError) {
    const reason = supabaseError.includes("expired") ? "expired" : "rejected";
    return NextResponse.redirect(`${origin}/admin/login?error=${reason}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing-code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Nearly always the verifier cookie missing: the link was opened in a
    // different browser from the one that asked for it.
    console.error("Sign-in code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/admin/login?error=wrong-browser`);
  }

  // Only ever redirect within this site.
  const target = next.startsWith("/") ? next : "/admin/event";
  return NextResponse.redirect(`${origin}${target}`);
}
