import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES, paymentMethodLabel } from "@/lib/applications";
import { imageUrl } from "@/lib/images";
import type { ApplicationStatus, CarverApplication, VendorApplication } from "@/lib/types";

/**
 * Applications as a CSV, for the Chainsaw Committee's review spreadsheet.
 *
 * The carver CSV carries a "Photos" column of public URLs, comma-separated:
 * that is the shape Airtable's CSV import turns into attachments, so the work
 * samples land in the base alongside the application instead of only living on
 * the Applications screen.
 *
 * RLS already limits both tables to admins, and this checks the allowlist too
 * so a session from the Chamber app's shared auth pool can't pull addresses and
 * phone numbers by guessing the URL.
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

  const params = request.nextUrl.searchParams;
  const kind = params.get("type") === "vendor" ? "vendor" : "carver";
  const table = kind === "vendor" ? "vendor_applications" : "carver_applications";

  let query = supabase.from(table).select("*").order("created_at", { ascending: false });

  const status = params.get("status");
  if (status && APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
    query = query.eq("status", status);
  }

  const year = Number.parseInt(params.get("year") ?? "", 10);
  if (Number.isFinite(year)) {
    query = query.eq("year", year);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { header, body } =
    kind === "vendor"
      ? vendorRows((data ?? []) as VendorApplication[])
      : carverRows((data ?? []) as CarverApplication[]);

  const csv = [header, ...body].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="odccc-${kind}-applications-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Column names match the Chamber's Airtable carver table field for field
 * (First Name, Last Name, Division, Phone Number, T-Shirt Size, Email, Mailing
 * Address, Vendor Space, Notes, FB — FB now carries the Facebook link), so
 * Airtable's CSV import maps them without
 * anyone re-pairing columns. The rest are the questions the printed form asks
 * that the table doesn't have a field for yet — map them or skip them.
 */
function carverRows(rows: CarverApplication[]) {
  return {
    header: [
      "First Name",
      "Last Name",
      "Division",
      "Phone Number",
      "T-Shirt Size",
      "Email",
      "Mailing Address",
      "Vendor Space",
      "Notes",
      "FB",
      "Website",
      "Instagram",
      "TikTok",
      "Submitted",
      "Year",
      "Status",
      "OK to Text",
      "Quick Carve Comfort",
      "Experience",
      "Photos Submitted",
      "Photos",
      "Selling Business Name",
      "Selling Spaces",
      "Selling Other Items",
      "Selling Fee",
      "Selling Payment",
      "Selling Check #",
      "Selling Signed By",
      "Committee Notes",
    ],
    body: rows.map((r) => [
      r.first_name,
      r.last_name,
      r.division,
      r.phone,
      r.shirt_size,
      r.email,
      mailingAddress(r),
      r.wants_selling_space ? `Yes — ${r.selling_spaces ?? 1} space${(r.selling_spaces ?? 1) === 1 ? "" : "s"}` : "No",
      r.bio ?? "",
      r.facebook ?? "",
      r.website ?? "",
      r.instagram ?? "",
      r.tiktok ?? "",
      r.created_at.slice(0, 10),
      String(r.year),
      r.status,
      yesNo(r.text_ok),
      r.quick_carve_comfort,
      r.experience,
      String(r.photo_paths.length),
      photoUrls(r.photo_paths),
      r.selling_business_name ?? "",
      r.selling_spaces == null ? "" : String(r.selling_spaces),
      r.wants_selling_space ? (r.sells_other_items ? `Yes — ${r.selling_other_items ?? ""}` : "No") : "",
      r.selling_fee_total == null ? "" : String(r.selling_fee_total),
      r.selling_payment_method ? paymentMethodLabel(r.selling_payment_method) : "",
      r.selling_check_number ?? "",
      r.selling_signature_name ?? "",
      r.admin_notes ?? "",
    ]),
  };
}

/** No Airtable table exists for vendors yet, so these are simply readable names. */
function vendorRows(rows: VendorApplication[]) {
  return {
    header: [
      "Business Name",
      "Booth Type",
      "Chamber Member",
      "First Name",
      "Last Name",
      "Email",
      "Phone Number",
      "Fax",
      "Website",
      "Mailing Address",
      "Spaces",
      "Electrical",
      "Electrical Needs",
      "Fee Total",
      "Near Vendor",
      "Items for Sale",
      "Workers Comp",
      "Signed By",
      "Signed On",
      "Submitted",
      "Year",
      "Status",
      "Committee Notes",
    ],
    body: rows.map((r) => [
      r.business_name,
      r.booth_type,
      yesNo(r.chamber_member),
      r.first_name,
      r.last_name,
      r.email,
      r.phone,
      r.fax ?? "",
      r.website ?? "",
      mailingAddress(r),
      String(r.spaces),
      yesNo(r.electrical),
      r.electrical_needs ?? "",
      String(r.fee_total),
      r.near_vendor ?? "",
      r.items_for_sale,
      r.workers_comp === "has-employees" ? "Has employees" : "No employees",
      r.signature_name,
      r.signed_at.slice(0, 10),
      r.created_at.slice(0, 10),
      String(r.year),
      r.status,
      r.admin_notes ?? "",
    ]),
  };
}

/**
 * Public URLs, comma-separated in one cell — what Airtable's importer expects
 * for an attachment field with several files.
 */
function photoUrls(paths: string[]): string {
  return paths
    .map((path) => imageUrl(path))
    .filter((url): url is string => Boolean(url))
    .join(",");
}

/** One field, the way the Airtable table keeps it: "123 Main St, Reedsport, OR 97467". */
function mailingAddress(r: {
  street_address: string;
  city: string;
  state: string;
  zip: string;
}): string {
  return `${r.street_address}, ${r.city}, ${r.state} ${r.zip}`;
}

const yesNo = (value: boolean): string => (value ? "Yes" : "No");

/**
 * Quote anything a spreadsheet would misread, and defuse the leading characters
 * Excel treats as the start of a formula — a business name someone typed as
 * "=cmd|..." must never execute when the Chamber opens the file.
 */
function escapeCsv(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
