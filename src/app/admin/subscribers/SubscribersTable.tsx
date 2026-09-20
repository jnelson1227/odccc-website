"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { Toast } from "@/components/admin/SaveBar";
import { Card, Field, StatusPill, TableHead, cellClass, inputClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { deleteSubscriber, setSubscriberStatus } from "@/lib/actions/content";
import type { Subscriber } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "/carvers" → "Carvers page", so the table reads like the mockup. */
function sourceLabel(source: string | null): string {
  if (!source) return "—";
  if (source === "/") return "Homepage";
  const name = source.replace(/^\//, "").split("/")[0].replace(/-/g, " ");
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} page`;
}

export default function SubscribersTable({
  subscribers,
  recentCount,
}: {
  subscribers: Subscriber[];
  /** Counted on the server — reading the clock during render isn't pure. */
  recentCount: number;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"subscribed" | "unsubscribed" | "all">("subscribed");
  const searchId = useId();
  const statusId = useId();

  const counts = useMemo(
    () => ({
      total: subscribers.filter((s) => s.status === "subscribed").length,
      gone: subscribers.filter((s) => s.status === "unsubscribed").length,
    }),
    [subscribers],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (!q) return true;
      return s.email.toLowerCase().includes(q) || (s.first_name ?? "").toLowerCase().includes(q);
    });
  }, [subscribers, query, status]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Stat value={counts.total} label="Subscribers" />
        <Stat value={recentCount} label="New in the last 30 days" />
        <Stat value={counts.gone} label="Unsubscribed" />
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Search subscribers" htmlFor={searchId}>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or email"
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
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="all">All</option>
            </select>
          </Field>
          <a
            href={`/admin/subscribers/export${status === "all" ? "" : `?status=${status}`}`}
            className="flex min-h-11 shrink-0 items-center rounded-md bg-fir-900 px-4 py-[11px] text-[15px] font-bold text-cream no-underline"
          >
            Export CSV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <TableHead
              columns={["First name", "Email", "Signed up from", "Date", "Status", ""]}
            />
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className={cellClass}>{s.first_name ?? "—"}</td>
                  <td className={cellClass}>{s.email}</td>
                  <td className={cellClass}>{sourceLabel(s.source)}</td>
                  <td className={cellClass}>{DATE.format(new Date(s.created_at))}</td>
                  <td className={cellClass}>
                    <StatusPill
                      status={s.status === "subscribed" ? "Confirmed" : "Not attending"}
                    />
                    <span className="sr-only">{s.status}</span>
                  </td>
                  <td className={cellClass}>
                    <RowActions subscriber={s} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={`${cellClass} text-admin-muted`}>
                    {subscribers.length === 0
                      ? "No signups yet. They'll appear here as people use the form on the site."
                      : "Nothing matches that search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <span className="text-[13px] text-admin-muted">
          Export a CSV to import into Mailchimp, Constant Contact or Gmail. The mailing-list tool
          can be connected directly later.
        </span>
      </Card>
    </div>
  );
}

function RowActions({ subscriber }: { subscriber: Subscriber }) {
  const [statusState, statusAction] = useActionState(setSubscriberStatus, IDLE);
  const [deleteState, deleteAction] = useActionState(deleteSubscriber, IDLE);
  const [confirming, setConfirming] = useState(false);

  return (
    <span className="flex flex-wrap items-center gap-2">
      <form action={statusAction}>
        <input type="hidden" name="id" value={subscriber.id} />
        <input
          type="hidden"
          name="status"
          value={subscriber.status === "subscribed" ? "unsubscribed" : "subscribed"}
        />
        <button
          type="submit"
          className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold underline"
        >
          {subscriber.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
        </button>
      </form>

      {confirming ? (
        <form action={deleteAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={subscriber.id} />
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
          className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-pill-warn-text underline"
        >
          Delete
        </button>
      )}

      <Toast state={statusState} />
      <Toast state={deleteState} />
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
