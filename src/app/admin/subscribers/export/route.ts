import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Subscriber } from "@/lib/types";

/**
 * Subscribers as a CSV, for importing into Mailchimp, Constant Contact or
 * Gmail. RLS already limits `subscribers` to admins, but this checks the
 * allowlist too so a stray session can't pull the list by URL.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ error: "Not an admin" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status");
  let query = supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  if (status === "subscribed" || status === "unsubscribed") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Subscriber[];
  const header = ["first_name", "email", "source", "status", "signed_up"];
  const body = rows.map((r) => [
    r.first_name ?? "",
    r.email,
    r.source ?? "",
    r.status,
    r.created_at.slice(0, 10),
  ]);

  const csv = [header, ...body].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="odccc-subscribers-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Quote anything a spreadsheet would misread, and defuse the leading
 * characters Excel treats as the start of a formula — an address like
 * "=cmd|..." must never execute when the Chamber opens the file.
 */
function escapeCsv(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
