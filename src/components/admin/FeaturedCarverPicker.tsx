"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { imageUrl, initials } from "@/lib/images";
import type { Carver } from "@/lib/types";

const SLOTS = 6;

/**
 * Picks the six carvers shown in "Meet the carvers", in order.
 *
 * The mockup shows drag-to-reorder. This uses Move up / Move down buttons
 * instead: same result, but it works with a keyboard, with a screen reader and
 * on a phone — which is where a Chamber volunteer is most likely to be.
 */
export default function FeaturedCarverPicker({
  carvers,
  initialIds,
}: {
  carvers: Carver[];
  initialIds: string[];
}) {
  const [chosen, setChosen] = useState<string[]>(initialIds.slice(0, SLOTS));
  const [query, setQuery] = useState("");
  const searchId = useId();

  const byId = useMemo(() => new Map(carvers.map((c) => [c.id, c])), [carvers]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = carvers.filter((c) => !chosen.includes(c.id));
    if (!q) return pool.slice(0, 12);
    return pool
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || (c.hometown ?? "").toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [carvers, chosen, query]);

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= chosen.length) return;
    const next = [...chosen];
    [next[index], next[target]] = [next[target], next[index]];
    setChosen(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {chosen.map((id) => (
        <input key={id} type="hidden" name="featured_carver_ids" value={id} />
      ))}

      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {chosen.map((id, index) => {
          const carver = byId.get(id);
          if (!carver) return null;
          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-md border border-admin-border bg-admin-tint p-2"
            >
              <span className="w-5 shrink-0 text-center text-[13px] font-bold text-admin-muted">
                {index + 1}
              </span>
              <Thumb carver={carver} />
              <span className="min-w-0 flex-grow">
                <span className="block truncate text-[14px] font-semibold">{carver.name}</span>
                <span className="block truncate text-[12px] text-admin-muted">
                  {carver.hometown}
                </span>
              </span>
              <span className="flex shrink-0 gap-1">
                <IconButton
                  label={`Move ${carver.name} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </IconButton>
                <IconButton
                  label={`Move ${carver.name} down`}
                  disabled={index === chosen.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </IconButton>
                <IconButton
                  label={`Remove ${carver.name}`}
                  onClick={() => setChosen(chosen.filter((c) => c !== id))}
                >
                  ×
                </IconButton>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="m-0 text-[13px] text-admin-muted" aria-live="polite">
        {chosen.length} of {SLOTS} chosen
        {chosen.length < SLOTS && " — the homepage looks best with all six."}
      </p>

      {chosen.length < SLOTS && (
        <div className="flex flex-col gap-2">
          <label htmlFor={searchId} className="text-[13px] font-semibold">
            Add a carver
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or hometown"
            className="min-h-11 w-full rounded-md border border-admin-border bg-white px-3 py-[10px] text-[15px]"
          />
          <ul className="m-0 flex max-h-64 list-none flex-col gap-1 overflow-y-auto p-0">
            {matches.map((carver) => (
              <li key={carver.id}>
                <button
                  type="button"
                  onClick={() => {
                    setChosen([...chosen, carver.id]);
                    setQuery("");
                  }}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border-none bg-transparent p-2 text-left hover:bg-admin-tint"
                >
                  <Thumb carver={carver} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold">{carver.name}</span>
                    <span className="block truncate text-[12px] text-admin-muted">
                      {carver.hometown}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 && (
              <li className="px-2 py-3 text-[13px] text-admin-muted">No carvers match that.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Thumb({ carver }: { carver: Carver }) {
  const src = imageUrl(carver.photo_path);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={48}
        unoptimized
        className="h-12 w-10 shrink-0 rounded object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-10 shrink-0 items-center justify-center rounded bg-admin-bg text-[13px] font-bold text-admin-muted"
    >
      {initials(carver.name)}
    </span>
  );
}

function IconButton({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="h-11 w-11 cursor-pointer rounded-md border border-admin-border bg-white text-[16px] leading-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
