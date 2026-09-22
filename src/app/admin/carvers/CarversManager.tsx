"use client";

import Image from "next/image";
import { useActionState, useId, useMemo, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveBar, { Toast } from "@/components/admin/SaveBar";
import {
  Card,
  Checkbox,
  Field,
  StatusPill,
  TableHead,
  cellClass,
  inputClass,
  textareaClass,
} from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { copyLastYearLineup, saveCarver } from "@/lib/actions/carvers";
import { imageUrl, initials } from "@/lib/images";
import type { CarverStatus, Division } from "@/lib/types";

export type CarverRow = {
  id: string;
  name: string;
  hometown: string | null;
  country: string | null;
  division: Division;
  studio: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  card_line: string | null;
  bio: string | null;
  honor_badge: string | null;
  photo_path: string | null;
  photo_alt: string | null;
  portrait_path: string | null;
  portrait_alt: string | null;
  status: CarverStatus | null;
  featured: boolean;
};

const STATUSES: CarverStatus[] = ["Confirmed", "Invited", "Not attending"];

export default function CarversManager({
  carvers,
  year,
}: {
  carvers: CarverRow[];
  year: number;
}) {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState<"All" | Division>("All");
  const [status, setStatus] = useState<"All" | CarverStatus | "Not set">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const searchId = useId();
  const divisionId = useId();
  const statusId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return carvers.filter((c) => {
      if (division !== "All" && c.division !== division) return false;
      if (status === "Not set" && c.status !== null) return false;
      if (status !== "All" && status !== "Not set" && c.status !== status) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) || (c.hometown ?? "").toLowerCase().includes(q)
      );
    });
  }, [carvers, query, division, status]);

  const editing = carvers.find((c) => c.id === editingId) ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_440px]">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Search carvers" htmlFor={searchId}>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or hometown"
              className={inputClass}
            />
          </Field>
          <Field label="Division" htmlFor={divisionId}>
            <select
              id={divisionId}
              value={division}
              onChange={(e) => setDivision(e.target.value as typeof division)}
              className={inputClass}
            >
              <option>All</option>
              <option>Pro</option>
              <option>Semi-Pro</option>
            </select>
          </Field>
          <Field label={`${year} status`} htmlFor={statusId}>
            <select
              id={statusId}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={inputClass}
            >
              <option>All</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
              <option>Not set</option>
            </select>
          </Field>
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
            className="min-h-11 shrink-0 cursor-pointer rounded-md border-none bg-fir-900 px-4 py-[11px] text-[15px] font-bold text-cream"
          >
            + Add carver
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <TableHead columns={["", "Name", "Hometown", "Division", String(year), "Homepage", ""]} />
            <tbody>
              {filtered.map((carver) => (
                <tr key={carver.id} className={carver.featured ? "bg-admin-highlight" : undefined}>
                  <td className={cellClass}>
                    <Thumb carver={carver} />
                  </td>
                  <td className={cellClass}>
                    <strong>{carver.name}</strong>
                  </td>
                  <td className={cellClass}>{carver.hometown}</td>
                  <td className={cellClass}>{carver.division}</td>
                  <td className={cellClass}>
                    {carver.status ? (
                      <StatusPill status={carver.status} />
                    ) : (
                      <span className="text-admin-muted">Not set</span>
                    )}
                  </td>
                  <td className={cellClass}>
                    {carver.featured && (
                      <span className="font-bold text-pill-warn-text">Featured</span>
                    )}
                  </td>
                  <td className={cellClass}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(carver.id);
                        setAdding(false);
                      }}
                      className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[14px] font-semibold underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-admin-muted">
            Showing {filtered.length} of {carvers.length} · Carvers from past years stay in the
            list — just change their status.
          </span>
          <CopyLineup year={year} />
        </div>
      </Card>

      {(editing || adding) && (
        <CarverEditor
          key={editing?.id ?? "new"}
          carver={editing}
          year={year}
          onDone={() => {
            setEditingId(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function CopyLineup({ year }: { year: number }) {
  const [state, action] = useActionState(copyLastYearLineup, IDLE);

  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="year" value={year} />
      <button
        type="submit"
        className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
      >
        Copy {year - 1} lineup as Invited
      </button>
      <Toast state={state} />
    </form>
  );
}

function CarverEditor({
  carver,
  year,
  onDone,
}: {
  carver: CarverRow | null;
  year: number;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveCarver, IDLE);

  return (
    <Card title={carver ? "Edit carver" : "Add carver"}>
      <form action={action} className="flex flex-col gap-4">
        {carver && <input type="hidden" name="id" value={carver.id} />}
        <input type="hidden" name="year" value={year} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageUpload
            name="portrait_path"
            altName="portrait_alt"
            initialPath={carver?.portrait_path}
            initialAlt={carver?.portrait_alt}
            label="Photo of the carver"
            hint="The one the carver sent in. This is the photo the Carvers page shows. Tall photos work best. Under 5 MB."
            requireAlt
            folder="carvers"
          />
          <ImageUpload
            name="photo_path"
            altName="photo_alt"
            initialPath={carver?.photo_path}
            initialAlt={carver?.photo_alt}
            label="Their carving"
            hint="The sculpture they competed with. Shown on the carver's own page. Under 5 MB."
            requireAlt
            folder="carvers"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="carver-name">
            <input
              id="carver-name"
              name="name"
              type="text"
              required
              defaultValue={carver?.name ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Hometown" htmlFor="carver-hometown">
            <input
              id="carver-hometown"
              name="hometown"
              type="text"
              defaultValue={carver?.hometown ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Division" htmlFor="carver-division">
            <select
              id="carver-division"
              name="division"
              defaultValue={carver?.division ?? "Pro"}
              className={inputClass}
            >
              <option>Pro</option>
              <option>Semi-Pro</option>
            </select>
          </Field>
          <Field label={`${year} status`} htmlFor="carver-status">
            <select
              id="carver-status"
              name="status"
              defaultValue={carver?.status ?? "Invited"}
              className={inputClass}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Country" htmlFor="carver-country">
            <input
              id="carver-country"
              name="country"
              type="text"
              defaultValue={carver?.country ?? "USA"}
              className={inputClass}
            />
          </Field>
          <Field label="Studio / business" htmlFor="carver-studio">
            <input
              id="carver-studio"
              name="studio"
              type="text"
              defaultValue={carver?.studio ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Website" htmlFor="carver-website">
          <input
            id="carver-website"
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={carver?.website ?? ""}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="Facebook"
            htmlFor="carver-facebook"
            hint="Paste the full page link to make it clickable"
          >
            <input
              id="carver-facebook"
              name="facebook"
              type="text"
              placeholder="Page name or link"
              defaultValue={carver?.facebook ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Instagram" htmlFor="carver-instagram" hint="Handle, e.g. @carver">
            <input
              id="carver-instagram"
              name="instagram"
              type="text"
              placeholder="@handle"
              defaultValue={carver?.instagram ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="TikTok" htmlFor="carver-tiktok" hint="Handle, e.g. @carver">
            <input
              id="carver-tiktok"
              name="tiktok"
              type="text"
              placeholder="@handle"
              defaultValue={carver?.tiktok ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Card line (short)"
          htmlFor="carver-card-line"
          hint="Shows under the name on carver cards · 80 characters"
        >
          <input
            id="carver-card-line"
            name="card_line"
            type="text"
            maxLength={80}
            defaultValue={carver?.card_line ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Full bio" htmlFor="carver-bio">
          <textarea
            id="carver-bio"
            name="bio"
            rows={4}
            defaultValue={carver?.bio ?? ""}
            className={textareaClass}
          />
        </Field>

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
          <Field
            label="Honor badge"
            htmlFor="carver-honor"
            hint="e.g. 2025 Champion, Co-founder, International"
          >
            <input
              id="carver-honor"
              name="honor_badge"
              type="text"
              defaultValue={carver?.honor_badge ?? ""}
              className={inputClass}
            />
          </Field>
          <Checkbox
            id="carver-featured"
            name="featured"
            defaultChecked={carver?.featured}
            label="Feature on homepage"
            hint="Six carvers maximum"
          />
        </div>

        <SaveBar state={state} label={carver ? "Save carver" : "Add carver"}>
          <button
            type="button"
            onClick={onDone}
            className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            {state.status === "success" ? "Close" : "Cancel"}
          </button>
        </SaveBar>
      </form>
    </Card>
  );
}

function Thumb({ carver }: { carver: CarverRow }) {
  const src = imageUrl(carver.portrait_path ?? carver.photo_path);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={48}
        unoptimized
        className="h-12 w-10 rounded object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-10 items-center justify-center rounded bg-admin-bg text-[13px] font-bold text-admin-muted"
    >
      {initials(carver.name)}
    </span>
  );
}
