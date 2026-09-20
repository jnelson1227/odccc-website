import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where the magic link lands. Trades the one-time code for a session cookie,
 * then sends the volunteer to the admin. The allowlist check happens in
 * requireAdmin(), so an email that isn't an admin gets signed straight back
 * out with an explanation.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/event";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing-code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=expired`);
  }

  // Only ever redirect within this site.
  const target = next.startsWith("/") ? next : "/admin/event";
  return NextResponse.redirect(`${origin}${target}`);
}
