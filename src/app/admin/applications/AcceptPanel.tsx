"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useId, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Toast } from "@/components/admin/SaveBar";
import { Field, inputClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { acceptCarverApplication } from "@/lib/actions/applications";
import { hometownFrom, matchCarvers } from "@/lib/applications";
import { imageUrl } from "@/lib/images";
import type { Carver, CarverApplication } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Los_Angeles",
});

/**
 * The committee's "yes" — turn an application into a spot in this year's
 * lineup, on an existing carver's profile or a brand-new one.
 *
 * Nothing here is automatic. Likely matches are suggested, but the admin
 * chooses; for a returning carver each field is a tick, so a polished bio on
 * the site isn't replaced by a two-line note unless someone means it. Every
 * photo carried over needs alt text — the application never asked for it, and
 * the site requires it.
 */
export default function AcceptPanel({
  application,
  profiles,
  year,
}: {
  application: CarverApplication;
  profiles: Carver[];
  year: number;
}) {
  const [state, action] = useActionState(acceptCarverApplication, IDLE);

  const matches = useMemo(() => matchCarvers(application, profiles), [application, profiles]);
  const bestMatch = matches.find((m) => m.reason === "same name")?.carver ?? null;

  const [carverId, setCarverId] = useState<string>(application.carver_id ?? bestMatch?.id ?? "");
  const existing = profiles.find((p) => p.id === carverId) ?? null;
  const selectId = useId();

  const linked = application.carver_id
    ? profiles.find((p) => p.id === application.carver_id) ?? null
    : null;

  if (application.status === "Accepted" && linked) {
    return (
      <div className="flex flex-col gap-2 rounded-[10px] border border-pill-ok-text/40 bg-pill-ok-bg p-4 text-[14px] text-pill-ok-text">
        <strong>Accepted{application.accepted_at && ` ${DATE.format(new Date(application.accepted_at))}`}</strong>
        <span>
          Confirmed for {year} as{" "}
          <Link href={`/carvers/${linked.slug}`} target="_blank" className="font-bold">
            {linked.name}
          </Link>
          . Edit the profile under Carvers.
        </span>
      </div>
    );
  }

  const hometown = hometownFrom(application);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-[10px] border-2 border-gold bg-admin-card p-4"
    >
      <input type="hidden" name="id" value={application.id} />

      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-[16px] font-bold">Accept for {year}</h3>
        <p className="m-0 text-[13px] text-admin-muted">
          Confirms them in the {year} lineup and puts their answers on the site.
        </p>
      </div>

      <Field
        label="This carver is"
        htmlFor={selectId}
        hint={
          matches.length > 0
            ? `${matches.length} possible match${matches.length === 1 ? "" : "es"} on the roster — check before accepting.`
            : "No one on the roster shares this name."
        }
      >
        <select
          id={selectId}
          name="carver_id"
          value={carverId}
          onChange={(e) => setCarverId(e.target.value)}
          className={inputClass}
        >
          <option value="">
            New carver — create {application.first_name} {application.last_name}
          </option>
          {matches.length > 0 && (
            <optgroup label="Likely matches">
              {matches.map(({ carver, reason }) => (
                <option key={carver.id} value={carver.id}>
                  {carver.name}
                  {carver.hometown ? ` · ${carver.hometown}` : ""} ({reason})
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Everyone else">
            {profiles
              .filter((p) => !matches.some((m) => m.carver.id === p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.hometown ? ` · ${p.hometown}` : ""}
                </option>
              ))}
          </optgroup>
        </select>
      </Field>

      {existing ? (
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-1 p-0 text-[13px] font-semibold">
            Update on {existing.name}&apos;s profile
          </legend>
          <Compare
            name="division"
            label="Division"
            current={existing.division}
            incoming={application.division}
          />
          <Compare name="hometown" label="Hometown" current={existing.hometown} incoming={hometown} />
          <Compare
            name="bio"
            label="Bio"
            current={existing.bio ? `${existing.bio.slice(0, 90)}${existing.bio.length > 90 ? "…" : ""}` : null}
            incoming={application.bio ? `${application.bio.slice(0, 90)}${application.bio.length > 90 ? "…" : ""}` : null}
          />
          <Compare name="website" label="Website" current={existing.website} incoming={application.website} />
          <Compare name="facebook" label="Facebook" current={existing.facebook} incoming={application.facebook} />
          <Compare name="instagram" label="Instagram" current={existing.instagram} incoming={application.instagram} />
          <Compare name="tiktok" label="TikTok" current={existing.tiktok} incoming={application.tiktok} />
        </fieldset>
      ) : (
        <p className="m-0 rounded-md bg-admin-tint px-3 py-2 text-[13px]">
          A new profile at <code>/carvers/</code> with their name, {application.division},{" "}
          {hometown || "no hometown"}, {application.bio ? "their bio" : "no bio yet"} and any links
          they gave.
        </p>
      )}

      <Photos application={application} existing={existing} />

      {state.status === "error" && (
        <p role="alert" className="m-0 rounded-md bg-pill-warn-bg px-3 py-2 text-[13px] font-semibold text-pill-warn-text">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <AcceptButton year={year} />
        <Toast state={state} />
      </div>
    </form>
  );
}

/** One field: what the site has now, what the application says, and a tick. */
function Compare({
  name,
  label,
  current,
  incoming,
}: {
  name: string;
  label: string;
  current: string | null;
  incoming: string | null;
}) {
  const id = useId();
  const differs = Boolean(incoming) && incoming !== current;

  if (!incoming) {
    return (
      <div className="flex items-baseline gap-2 text-[13px] text-admin-muted">
        <span className="w-[76px] shrink-0 font-semibold">{label}</span>
        <span>Not given — keeps “{current ?? "—"}”</span>
      </div>
    );
  }

  return (
    <label htmlFor={id} className="flex min-h-11 items-start gap-2 text-[13px]">
      <input
        id={id}
        name={`update_${name}`}
        type="checkbox"
        defaultChecked={differs}
        className="mt-[3px] h-[16px] w-[16px] shrink-0 accent-fir-900"
      />
      <span className="w-[68px] shrink-0 pt-[1px] font-semibold">{label}</span>
      <span className="flex min-w-0 flex-col gap-[2px]">
        <span className="break-words">{incoming}</span>
        <span className="break-words text-admin-muted">
          {differs ? `now: ${current ?? "—"}` : "same as now"}
        </span>
      </span>
    </label>
  );
}

/** Which photos come across, their alt text, and which one is the carver's portrait. */
function Photos({
  application,
  existing,
}: {
  application: CarverApplication;
  existing: Carver | null;
}) {
  const name = `${application.first_name} ${application.last_name}`;
  const hasPortrait = Boolean(existing?.portrait_path);

  if (application.photo_paths.length === 0) {
    return <p className="m-0 text-[13px] text-admin-muted">No photos came with this application.</p>;
  }

  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-1 p-0 text-[13px] font-semibold">
        Photos for the site
        <span className="block text-[12px] font-normal text-admin-muted">
          Untick any you don&apos;t want shown. Each one needs alt text — say what&apos;s in it.
          {hasPortrait
            ? ` ${existing?.name} already has a carver photo, so these join the gallery unless you pick one to replace it.`
            : " Pick the one that shows the carver as their carver photo; the rest go in a gallery."}
        </span>
      </legend>

      <label className="flex min-h-11 items-center gap-2 text-[13px]">
        <input
          type="radio"
          name="portrait_index"
          value=""
          defaultChecked={hasPortrait}
          className="h-[16px] w-[16px] accent-fir-900"
        />
        {hasPortrait ? "Keep the current carver photo" : "None of these shows the carver"}
      </label>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {application.photo_paths.map((path, i) => (
          <PhotoRow
            key={path}
            index={i}
            src={imageUrl(path) ?? ""}
            defaultPortrait={!hasPortrait && i === 0}
            placeholder={`Carving by ${name}`}
          />
        ))}
      </ul>
    </fieldset>
  );
}

function PhotoRow({
  index,
  src,
  defaultPortrait,
  placeholder,
}: {
  index: number;
  src: string;
  defaultPortrait: boolean;
  placeholder: string;
}) {
  const [included, setIncluded] = useState(true);
  const includeId = useId();
  const altId = useId();

  return (
    <li className="flex gap-3 rounded-md border border-admin-border bg-admin-tint p-2">
      <a href={src} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <Image
          src={src}
          alt=""
          width={72}
          height={72}
          unoptimized
          className="h-[72px] w-[72px] rounded object-cover"
        />
      </a>
      <div className="flex min-w-0 flex-grow flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <label htmlFor={includeId} className="flex min-h-8 items-center gap-2 font-semibold">
            <input
              id={includeId}
              name={`photo_include_${index}`}
              type="checkbox"
              checked={included}
              onChange={(e) => setIncluded(e.target.checked)}
              className="h-[16px] w-[16px] accent-fir-900"
            />
            Photo {index + 1}
          </label>
          <label className="flex min-h-8 items-center gap-2">
            <input
              type="radio"
              name="portrait_index"
              value={index}
              defaultChecked={defaultPortrait}
              disabled={!included}
              className="h-[16px] w-[16px] accent-fir-900"
            />
            Carver photo
          </label>
        </div>
        <input
          id={altId}
          name={`photo_alt_${index}`}
          type="text"
          required={included}
          disabled={!included}
          maxLength={200}
          placeholder={placeholder}
          aria-label={`Alt text for photo ${index + 1}`}
          className={`${inputClass} min-h-10 py-2 text-[14px] disabled:opacity-50`}
        />
      </div>
    </li>
  );
}

function AcceptButton({ year }: { year: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 cursor-pointer rounded-md border-none bg-gold px-[18px] py-[11px] text-[15px] font-bold text-brown disabled:opacity-70"
    >
      {pending ? "Accepting…" : `Accept for ${year}`}
    </button>
  );
}
