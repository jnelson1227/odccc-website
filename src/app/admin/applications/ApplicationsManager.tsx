"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useId, useMemo, useState } from "react";
import { Toast } from "@/components/admin/SaveBar";
import {
  Card,
  Field,
  Notice,
  StatusPill,
  TableHead,
  cellClass,
  inputClass,
  textareaClass,
} from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import {
  deleteApplication,
  saveApplicationNotes,
  setApplicationStatus,
} from "@/lib/actions/applications";
import { APPLICATION_STATUSES, money } from "@/lib/applications";
import { imageUrl } from "@/lib/images";
import type { ApplicationStatus, CarverApplication, VendorApplication } from "@/lib/types";

type Kind = "carver" | "vendor";

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Los_Angeles",
});

/** Application statuses reuse the carver/sponsor pill colours. */
const PILL_FOR: Record<ApplicationStatus, string> = {
  New: "Invited",
  Reviewed: "Pledged",
  Accepted: "Confirmed",
  Waitlisted: "Pledged",
  Declined: "Not attending",
};

export default function ApplicationsManager({
  kind,
  year,
  open,
  carvers,
  vendors,
}: {
  kind: Kind;
  year: number;
  open: Record<Kind, boolean>;
  carvers: CarverApplication[];
  vendors: VendorApplication[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">(year);
  const searchId = useId();
  const statusId = useId();
  const yearId = useId();

  const rows: (CarverApplication | VendorApplication)[] = kind === "carver" ? carvers : vendors;

  const years = useMemo(
    () => [...new Set([year, ...rows.map((r) => r.year)])].sort((a, b) => b - a),
    [rows, year],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (yearFilter !== "all" && r.year !== yearFilter) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      const haystack = [
        r.first_name,
        r.last_name,
        r.email,
        r.city,
        "business_name" in r ? r.business_name : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, status, yearFilter]);

  const newCount = rows.filter((r) => r.year === year && r.status === "New").length;

  const exportHref =
    `/admin/applications/export?type=${kind}` +
    (yearFilter === "all" ? "" : `&year=${yearFilter}`) +
    (status === "all" ? "" : `&status=${status}`);

  return (
    <div className="flex flex-col gap-5">
      {!open[kind] && (
        <Notice>
          <span>
            {kind === "carver" ? "Carver" : "Vendor"} applications are <strong>closed</strong> on the
            site right now. Open them under Event &amp; homepage → Applications.
          </span>
          <Link href="/admin/event#applications" className="shrink-0 font-bold underline">
            Open them
          </Link>
        </Notice>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Application type">
        <Tab href="/admin/applications" active={kind === "carver"}>
          Carvers
          <Count value={carvers.filter((r) => r.year === year && r.status === "New").length} />
        </Tab>
        <Tab href="/admin/applications?type=vendor" active={kind === "vendor"}>
          Vendors
          <Count value={vendors.filter((r) => r.year === year && r.status === "New").length} />
        </Tab>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Stat value={rows.filter((r) => r.year === year).length} label={`${year} applications`} />
        <Stat value={newCount} label="Waiting for review" />
        <Stat
          value={rows.filter((r) => r.year === year && r.status === "Accepted").length}
          label="Accepted"
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <Field label="Search" htmlFor={searchId}>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={kind === "carver" ? "Name, email or city" : "Business, name, email or city"}
              className={inputClass}
            />
          </Field>
          <Field label="Status" htmlFor={statusId}>
            <select
              id={statusId}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={inputClass}
            >
              <option value="all">All</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Year" htmlFor={yearId}>
            <select
              id={yearId}
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className={inputClass}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
              <option value="all">All years</option>
            </select>
          </Field>
          <a
            href={exportHref}
            className="flex min-h-11 shrink-0 items-center rounded-md bg-fir-900 px-4 py-[11px] text-[15px] font-bold text-cream no-underline"
          >
            Export CSV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <TableHead
              columns={
                kind === "carver"
                  ? ["Applicant", "Division", "Contact", "Photos", "Selling space", "Submitted", "Status"]
                  : ["Business", "Booth", "Contact", "Spaces", "Fee", "Submitted", "Status"]
              }
            />
            <tbody>
              {filtered.map((r) =>
                kind === "carver" ? (
                  <CarverRow key={r.id} row={r as CarverApplication} />
                ) : (
                  <VendorRow key={r.id} row={r as VendorApplication} />
                ),
              )}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className={`${cellClass} text-admin-muted`}>
                    {rows.length === 0
                      ? `No ${kind} applications yet. They'll appear here as people apply on the site.`
                      : "Nothing matches those filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <span className="text-[13px] text-admin-muted">
          Click a row to see the whole application. The CSV is laid out for Airtable&apos;s
          &ldquo;Import CSV&rdquo; — column names match the carver table&apos;s fields, and the
          &ldquo;Photos&rdquo; column of links becomes attachments when you map it to an attachment
          field.
        </span>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------ rows

function CarverRow({ row }: { row: CarverApplication }) {
  const [openRow, setOpenRow] = useState(false);
  return (
    <>
      <tr
        onClick={() => setOpenRow((o) => !o)}
        className="cursor-pointer hover:bg-admin-tint"
        aria-expanded={openRow}
      >
        <td className={cellClass}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenRow((o) => !o);
            }}
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-left font-semibold"
          >
            {row.first_name} {row.last_name}
            <span className="block text-[12px] font-normal text-admin-muted">
              {row.city}, {row.state}
            </span>
          </button>
        </td>
        <td className={cellClass}>{row.division}</td>
        <td className={cellClass}>
          <a href={`mailto:${row.email}`} className="text-admin-text" onClick={(e) => e.stopPropagation()}>
            {row.email}
          </a>
          <span className="block text-[12px] text-admin-muted">
            {row.phone}
            {row.text_ok && " · texts OK"}
          </span>
        </td>
        <td className={cellClass}>{row.photo_paths.length}</td>
        <td className={cellClass}>
          {row.wants_selling_space
            ? `${row.selling_spaces ?? 1} × ${money(row.selling_fee_total ?? 0)}`
            : "—"}
        </td>
        <td className={cellClass}>{DATE.format(new Date(row.created_at))}</td>
        <td className={cellClass}>
          <StatusPill status={PILL_FOR[row.status]} />
          <span className="sr-only">{row.status}</span>
        </td>
      </tr>
      {openRow && (
        <tr>
          <td colSpan={7} className="border-b border-admin-rule bg-admin-tint px-3 py-5">
            <CarverDetail row={row} />
          </td>
        </tr>
      )}
    </>
  );
}

function VendorRow({ row }: { row: VendorApplication }) {
  const [openRow, setOpenRow] = useState(false);
  return (
    <>
      <tr
        onClick={() => setOpenRow((o) => !o)}
        className="cursor-pointer hover:bg-admin-tint"
        aria-expanded={openRow}
      >
        <td className={cellClass}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenRow((o) => !o);
            }}
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-left font-semibold"
          >
            {row.business_name}
            <span className="block text-[12px] font-normal text-admin-muted">
              {row.first_name} {row.last_name} · {row.city}, {row.state}
            </span>
          </button>
        </td>
        <td className={cellClass}>
          {row.booth_type}
          {row.chamber_member && (
            <span className="block text-[12px] text-admin-muted">Chamber member</span>
          )}
        </td>
        <td className={cellClass}>
          <a href={`mailto:${row.email}`} className="text-admin-text" onClick={(e) => e.stopPropagation()}>
            {row.email}
          </a>
          <span className="block text-[12px] text-admin-muted">{row.phone}</span>
        </td>
        <td className={cellClass}>
          {row.spaces}
          {row.electrical && <span className="block text-[12px] text-admin-muted">+ power</span>}
        </td>
        <td className={cellClass}>{money(row.fee_total)}</td>
        <td className={cellClass}>{DATE.format(new Date(row.created_at))}</td>
        <td className={cellClass}>
          <StatusPill status={PILL_FOR[row.status]} />
          <span className="sr-only">{row.status}</span>
        </td>
      </tr>
      {openRow && (
        <tr>
          <td colSpan={7} className="border-b border-admin-rule bg-admin-tint px-3 py-5">
            <VendorDetail row={row} />
          </td>
        </tr>
      )}
    </>
  );
}

// --------------------------------------------------------------- details

function CarverDetail({ row }: { row: CarverApplication }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <Section title="Contact">
          <Detail label="Mailing address">
            {row.street_address}, {row.city}, {row.state} {row.zip}
          </Detail>
          <Detail label="Phone">
            {row.phone} {row.text_ok ? "(texts welcome)" : "(no texts)"}
          </Detail>
          <Detail label="Email">{row.email}</Detail>
        </Section>

        <Section title="Event">
          <Detail label="Division">{row.division}</Detail>
          <Detail label="T-shirt">{row.shirt_size}</Detail>
          <Detail label="Quick Carves">{row.quick_carve_comfort} comfortable</Detail>
          <Detail label="Experience" block>
            {row.experience}
          </Detail>
        </Section>

        <Section title="Announcement bio">
          <Detail label="Bio" block>
            {row.bio ?? <em className="text-admin-muted">Not provided yet</em>}
          </Detail>
          <Detail label="Public contact">{row.public_contact ?? "—"}</Detail>
        </Section>

        {row.wants_selling_space && (
          <Section title="Selling space">
            <Detail label="Business">{row.selling_business_name ?? "—"}</Detail>
            <Detail label="Spaces">
              {row.selling_spaces} — {money(row.selling_fee_total ?? 0)} due
            </Detail>
            <Detail label="Other items">
              {row.selling_other_items ?? "Carvings only"}
            </Detail>
          </Section>
        )}

        <Section title={`Photos (${row.photo_paths.length})`}>
          {row.photo_paths.length === 0 ? (
            <span className="text-[14px] text-admin-muted">None uploaded.</span>
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
              {row.photo_paths.map((path, i) => {
                const src = imageUrl(path) ?? "";
                return (
                  <li key={path}>
                    <a href={src} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={src}
                        alt={`Work sample ${i + 1} from ${row.first_name} ${row.last_name}`}
                        width={240}
                        height={240}
                        unoptimized
                        className="aspect-square w-full rounded-md border border-admin-border object-cover"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <Review kind="carver" id={row.id} status={row.status} notes={row.admin_notes} />
    </div>
  );
}

function VendorDetail({ row }: { row: VendorApplication }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <Section title="Business">
          <Detail label="Contact">
            {row.first_name} {row.last_name}
          </Detail>
          <Detail label="Mailing address">
            {row.street_address}, {row.city}, {row.state} {row.zip}
          </Detail>
          <Detail label="Phone">{row.phone}</Detail>
          {row.fax && <Detail label="Fax">{row.fax}</Detail>}
          <Detail label="Email">{row.email}</Detail>
          {row.website && (
            <Detail label="Website">
              <a href={row.website} target="_blank" rel="noopener noreferrer">
                {row.website}
              </a>
            </Detail>
          )}
          <Detail label="Chamber member">{row.chamber_member ? "Yes — check the list" : "No"}</Detail>
        </Section>

        <Section title="Booth">
          <Detail label="Type">{row.booth_type}</Detail>
          <Detail label="Spaces">{row.spaces}</Detail>
          <Detail label="Electrical">
            {row.electrical ? `Yes — ${row.electrical_needs ?? "no details given"}` : "No"}
          </Detail>
          <Detail label="Fee due">{money(row.fee_total)}</Detail>
          {row.near_vendor && <Detail label="Wants to be near">{row.near_vendor}</Detail>}
          <Detail label="Items for sale" block>
            {row.items_for_sale}
          </Detail>
        </Section>

        <Section title="Paperwork">
          <Detail label="Workers' comp">
            {row.workers_comp === "has-employees"
              ? "Has employees — proof of coverage must arrive before the event"
              : "No employees"}
          </Detail>
          <Detail label="Agreed to">
            {[
              row.agrees_terms && "terms & conditions",
              row.agrees_code_of_conduct && "code of conduct",
              row.agrees_waiver && "waiver",
            ]
              .filter(Boolean)
              .join(", ")}
          </Detail>
          <Detail label="Signed">
            {row.signature_name}, {DATE.format(new Date(row.signed_at))}
          </Detail>
          {row.booth_type === "Food" && (
            <p className="m-0 rounded-md border border-admin-highlight-border bg-admin-highlight px-3 py-2 text-[13px]">
              Food vendor: needs a temporary restaurant license and a liability certificate naming
              the Chamber and the City before set-up.
            </p>
          )}
        </Section>
      </div>

      <Review kind="vendor" id={row.id} status={row.status} notes={row.admin_notes} />
    </div>
  );
}

// ------------------------------------------------------------- review box

function Review({
  kind,
  id,
  status,
  notes,
}: {
  kind: Kind;
  id: string;
  status: ApplicationStatus;
  notes: string | null;
}) {
  const [statusState, statusAction] = useActionState(setApplicationStatus, IDLE);
  const [notesState, notesAction] = useActionState(saveApplicationNotes, IDLE);
  const [deleteState, deleteAction] = useActionState(deleteApplication, IDLE);
  const [confirming, setConfirming] = useState(false);
  const statusId = useId();
  const notesId = useId();

  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-admin-border bg-admin-card p-4">
      <form action={statusAction} className="flex flex-col gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <Field label="Status" htmlFor={statusId}>
          <select
            id={statusId}
            name="status"
            defaultValue={status}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className={inputClass}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Toast state={statusState} />
      </form>

      <form action={notesAction} className="flex flex-col gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <Field label="Committee notes" htmlFor={notesId} hint="Only admins see these.">
          <textarea
            id={notesId}
            name="admin_notes"
            rows={4}
            defaultValue={notes ?? ""}
            className={textareaClass}
          />
        </Field>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            Save notes
          </button>
          <Toast state={notesState} />
        </div>
      </form>

      <div className="border-t border-admin-rule pt-3">
        {confirming ? (
          <form action={deleteAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="id" value={id} />
            <span className="text-[13px]">Delete this application and its photos?</span>
            <button
              type="submit"
              className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-bold text-pill-warn-text underline"
            >
              Really delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold underline"
            >
              Keep
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-11 cursor-pointer border-none bg-transparent px-0 text-[13px] font-semibold text-pill-warn-text underline"
          >
            Delete application
          </button>
        )}
        <Toast state={deleteState} />
      </div>
    </div>
  );
}

// --------------------------------------------------------------- pieces

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 text-[12px] font-bold uppercase tracking-[1px] text-admin-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Detail({
  label,
  block,
  children,
}: {
  label: string;
  block?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`text-[14px] ${block ? "flex flex-col gap-1" : "flex flex-wrap gap-x-2"}`}>
      <span className="font-semibold">{label}:</span>
      <span className={block ? "whitespace-pre-wrap leading-[1.5]" : ""}>{children}</span>
    </div>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`flex min-h-11 items-center gap-2 rounded-md px-4 py-[10px] text-[15px] font-bold no-underline ${
        active
          ? "bg-fir-900 text-cream"
          : "border border-admin-border bg-white text-admin-text"
      }`}
    >
      {children}
    </Link>
  );
}

function Count({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span className="rounded-full bg-gold px-2 py-[2px] text-[12px] font-bold text-brown">
      {value} new
    </span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[10px] border border-admin-border bg-admin-card px-6 py-5">
      <span className="display text-[44px] font-black leading-none">{value}</span>
      <span className="text-[13px] text-admin-muted">{label}</span>
    </div>
  );
}
