import type { CarverStatus, SponsorStatus } from "@/lib/types";

export function Card({
  title,
  hint,
  children,
  className = "",
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-[10px] border border-admin-border bg-admin-card p-5 md:p-6 ${className}`}
    >
      {(title || hint) && (
        <div className="flex flex-col gap-1">
          {title && <h2 className="m-0 text-[17px] font-bold">{title}</h2>}
          {hint && <span className="text-[13px] text-admin-muted">{hint}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {hint && <span className="text-[12px] text-admin-muted">{hint}</span>}
    </div>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-md border border-admin-border bg-white px-3 py-[10px] text-[15px] text-admin-text";

export const textareaClass =
  "w-full resize-y rounded-md border border-admin-border bg-white px-3 py-[10px] text-[15px] leading-[1.45] text-admin-text";

/**
 * A value the admin doesn't get to type — the edition, the dates, the venue.
 * Green so it reads as "handled for you", not as a disabled input.
 */
export function Locked({ value, tag }: { value: string; tag: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-locked-border bg-locked-bg px-3 py-[10px]">
      <span className="text-[15px] font-semibold">{value}</span>
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[1px] text-locked-text">
        {tag}
      </span>
    </div>
  );
}

export function Checkbox({
  id,
  name,
  defaultChecked,
  label,
  hint,
}: {
  id: string;
  name: string;
  defaultChecked?: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 items-center gap-3 text-[14px] font-semibold">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-[18px] w-[18px] shrink-0 accent-fir-900"
      />
      <span className="flex flex-col gap-[2px]">
        {label}
        {hint && <span className="text-[12px] font-normal text-admin-muted">{hint}</span>}
      </span>
    </label>
  );
}

const PILL: Record<string, string> = {
  Confirmed: "bg-pill-ok-bg text-pill-ok-text",
  Paid: "bg-pill-ok-bg text-pill-ok-text",
  Invited: "bg-pill-warn-bg text-pill-warn-text",
  Pledged: "bg-pill-warn-bg text-pill-warn-text",
  "Not attending": "bg-pill-off-bg text-pill-off-text",
};

export function StatusPill({ status }: { status: CarverStatus | SponsorStatus | string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-1 text-[12px] font-bold ${
        PILL[status] ?? "bg-pill-off-bg text-pill-off-text"
      }`}
    >
      {status}
    </span>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr>
        {columns.map((column, i) => (
          <th
            key={`${column}-${i}`}
            scope="col"
            className="border-b border-admin-border px-3 py-[10px] text-left text-[12px] font-bold uppercase tracking-[1px] text-admin-muted"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export const cellClass = "border-b border-admin-rule px-3 py-2 text-[14px] align-middle";

export function DarkButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="min-h-11 cursor-pointer rounded-md border-none bg-fir-900 px-4 py-[11px] text-[15px] font-bold text-cream disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold text-admin-text disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-admin-highlight-border bg-admin-highlight px-[14px] py-3 text-[14px]">
      {children}
    </div>
  );
}
