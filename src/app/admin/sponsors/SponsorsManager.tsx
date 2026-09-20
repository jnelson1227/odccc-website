"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveBar, { Toast } from "@/components/admin/SaveBar";
import {
  Card,
  Checkbox,
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
  copyLastYearSponsors,
  deleteLevel,
  deleteSponsor,
  moveLevel,
  saveLevel,
  saveSponsor,
  saveSponsorshipForm,
} from "@/lib/actions/sponsors";
import { imageUrl } from "@/lib/images";
import type { Settings, Sponsor, SponsorshipLevel } from "@/lib/types";

export default function SponsorsManager({
  levels,
  sponsors,
  settings,
  year,
  years,
}: {
  levels: SponsorshipLevel[];
  sponsors: Sponsor[];
  settings: Settings;
  year: number;
  years: number[];
}) {
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [addingLevel, setAddingLevel] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<string | null>(null);
  const [addingSponsor, setAddingSponsor] = useState(false);

  const presentingLevel = levels[0];
  const presentingTaken = presentingLevel
    ? sponsors.some((s) => s.level_id === presentingLevel.id)
    : false;

  const level = levels.find((l) => l.id === editingLevel) ?? null;
  const sponsor = sponsors.find((s) => s.id === editingSponsor) ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_1.35fr]">
      {/* ------------------------------------------------ levels */}
      <Card
        title="Sponsorship levels"
        hint="The first level is the big card on the Sponsorship page. Use the arrows to reorder."
      >
        <ul className="m-0 flex list-none flex-col p-0">
          {levels.map((l, index) => {
            const taken = sponsors.filter((s) => s.level_id === l.id).length;
            return (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-2 border-t border-admin-rule py-3"
              >
                <span className="flex shrink-0 gap-1">
                  <MoveButton id={l.id} direction="up" disabled={index === 0} name={l.name} />
                  <MoveButton
                    id={l.id}
                    direction="down"
                    disabled={index === levels.length - 1}
                    name={l.name}
                  />
                </span>
                <strong className="min-w-0 flex-grow text-[15px]">{l.name}</strong>
                <span className="text-[14px]">{l.price_label}</span>
                <span className="text-[14px] text-admin-muted">
                  {l.max_available == null ? "Open" : `${l.max_available} avail.`}
                </span>
                <span className="text-[12px] font-bold text-pill-warn-text">
                  {l.max_available == null ? "—" : `${taken} of ${l.max_available}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLevel(l.id);
                    setAddingLevel(false);
                  }}
                  className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[14px] font-semibold underline"
                >
                  Edit
                </button>
              </li>
            );
          })}
        </ul>

        {(level || addingLevel) && (
          <LevelEditor
            key={level?.id ?? "new-level"}
            level={level}
            onDone={() => {
              setEditingLevel(null);
              setAddingLevel(false);
            }}
          />
        )}

        {!addingLevel && !level && (
          <button
            type="button"
            onClick={() => setAddingLevel(true)}
            className="min-h-11 w-fit cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            + Add level
          </button>
        )}

        <SponsorshipForm settings={settings} />
      </Card>

      {/* ------------------------------------------------ sponsors */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-grow flex-col gap-1">
            <h2 className="m-0 text-[17px] font-bold">{year} sponsors</h2>
            <span className="text-[13px] text-admin-muted">
              Logos show on the Sponsors page by level. Upload a white or one-colour logo for the
              dark site.
            </span>
          </div>
          <Field label="Year" htmlFor="sponsor-year">
            <select
              id="sponsor-year"
              defaultValue={year}
              onChange={(e) => {
                window.location.search = `?year=${e.target.value}`;
              }}
              className={inputClass}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={() => {
              setAddingSponsor(true);
              setEditingSponsor(null);
            }}
            className="min-h-11 shrink-0 cursor-pointer rounded-md border-none bg-fir-900 px-4 py-[11px] text-[15px] font-bold text-cream"
          >
            + Add sponsor
          </button>
        </div>

        {presentingLevel && !presentingTaken && (
          <Notice>
            <span>
              <strong>The {presentingLevel.name} slot is open.</strong> When one signs, set their
              level here and switch the lockup on under{" "}
              <Link href="/admin/event" className="underline">
                Event &amp; homepage
              </Link>
              .
            </span>
          </Notice>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <TableHead columns={["", "Sponsor", "Level", "Status", ""]} />
            <tbody>
              {sponsors.map((s) => {
                const logo = imageUrl(s.logo_path);
                return (
                  <tr key={s.id}>
                    <td className={cellClass}>
                      {logo ? (
                        <Image
                          src={logo}
                          alt=""
                          width={64}
                          height={32}
                          unoptimized
                          className="h-8 w-16 rounded bg-fir-900 object-contain p-1"
                        />
                      ) : (
                        <span className="text-[12px] text-admin-muted">No logo</span>
                      )}
                    </td>
                    <td className={cellClass}>
                      <strong>{s.name}</strong>
                      {s.in_kind_note && (
                        <span className="block text-[12px] text-admin-muted">
                          In kind: {s.in_kind_note}
                        </span>
                      )}
                    </td>
                    <td className={cellClass}>
                      {levels.find((l) => l.id === s.level_id)?.name ?? (
                        <span className="text-admin-muted">
                          {s.legacy_level ? `${s.legacy_level} (${year})` : "Not set"}
                        </span>
                      )}
                    </td>
                    <td className={cellClass}>
                      <StatusPill status={s.status} />
                    </td>
                    <td className={cellClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSponsor(s.id);
                          setAddingSponsor(false);
                        }}
                        className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[14px] font-semibold underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={5} className={`${cellClass} text-admin-muted`}>
                    No sponsors for {year} yet. The Sponsors page shows {year - 1}&apos;s list
                    until one is added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <CopySponsors year={year} />

        {(sponsor || addingSponsor) && (
          <SponsorEditor
            key={sponsor?.id ?? "new-sponsor"}
            sponsor={sponsor}
            levels={levels}
            year={year}
            onDone={() => {
              setEditingSponsor(null);
              setAddingSponsor(false);
            }}
          />
        )}
      </Card>
    </div>
  );
}

function MoveButton({
  id,
  direction,
  disabled,
  name,
}: {
  id: string;
  direction: "up" | "down";
  disabled: boolean;
  name: string;
}) {
  const [, action] = useActionState(moveLevel, IDLE);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={`Move ${name} ${direction}`}
        title={`Move ${name} ${direction}`}
        className="h-11 w-11 cursor-pointer rounded-md border border-admin-border bg-white text-[16px] leading-none disabled:opacity-40"
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

function LevelEditor({
  level,
  onDone,
}: {
  level: SponsorshipLevel | null;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveLevel, IDLE);
  const [removeState, removeAction] = useActionState(deleteLevel, IDLE);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-admin-border bg-admin-tint p-4">
      <span className="text-[13px] font-bold">
        {level ? `Editing: ${level.name}` : "New level"}
      </span>

      <form action={action} className="flex flex-col gap-4">
        {level && <input type="hidden" name="id" value={level.id} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Level name" htmlFor="level-name">
            <input
              id="level-name"
              name="name"
              type="text"
              required
              defaultValue={level?.name ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Price shown" htmlFor="level-price-label">
            <input
              id="level-price-label"
              name="price_label"
              type="text"
              required
              placeholder="$1,000+"
              defaultValue={level?.price_label ?? ""}
              className={inputClass}
            />
          </Field>
          <Field
            label="Price amount"
            htmlFor="level-price-amount"
            hint="Numbers only — used for sorting and reports."
          >
            <input
              id="level-price-amount"
              name="price_amount"
              type="number"
              min={0}
              defaultValue={level?.price_amount ?? ""}
              className={inputClass}
            />
          </Field>
          <Field
            label="How many available"
            htmlFor="level-max"
            hint="Leave blank for unlimited."
          >
            <input
              id="level-max"
              name="max_available"
              type="number"
              min={1}
              defaultValue={level?.max_available ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Benefits (one per line)" htmlFor="level-benefits">
          <textarea
            id="level-benefits"
            name="benefits"
            rows={6}
            defaultValue={(level?.benefits ?? []).join("\n")}
            className={textareaClass}
          />
        </Field>

        <div className="flex flex-col gap-1">
          <Checkbox
            id="level-show-logo"
            name="show_logo"
            defaultChecked={level?.show_logo}
            label="Show logos on the Sponsors page"
            hint="Off means sponsors at this level are listed by name."
          />
          <Checkbox
            id="level-on-poster"
            name="on_poster"
            defaultChecked={level?.on_poster}
            label="Include on the event poster"
          />
        </div>

        <SaveBar state={state} label={level ? "Save level" : "Add level"}>
          <button
            type="button"
            onClick={onDone}
            className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            {state.status === "success" ? "Close" : "Cancel"}
          </button>
        </SaveBar>
      </form>

      {level && (
        <form action={removeAction} className="flex items-center gap-3 border-t border-admin-rule pt-3">
          <input type="hidden" name="id" value={level.id} />
          <button
            type="submit"
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-pill-warn-text underline"
          >
            Remove this level
          </button>
          <Toast state={removeState} />
        </form>
      )}
    </div>
  );
}

function SponsorEditor({
  sponsor,
  levels,
  year,
  onDone,
}: {
  sponsor: Sponsor | null;
  levels: SponsorshipLevel[];
  year: number;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveSponsor, IDLE);
  const [removeState, removeAction] = useActionState(deleteSponsor, IDLE);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-admin-border bg-admin-tint p-4">
      <span className="text-[13px] font-bold">
        {sponsor ? `Editing: ${sponsor.name}` : `New ${year} sponsor`}
      </span>

      <form action={action} className="flex flex-col gap-4">
        {sponsor && <input type="hidden" name="id" value={sponsor.id} />}
        <input type="hidden" name="year" value={year} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="sponsor-name">
            <input
              id="sponsor-name"
              name="name"
              type="text"
              required
              defaultValue={sponsor?.name ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Level" htmlFor="sponsor-level">
            <select
              id="sponsor-level"
              name="level_id"
              defaultValue={sponsor?.level_id ?? ""}
              className={inputClass}
            >
              <option value="">— Not set —</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.price_label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="sponsor-status">
            <select
              id="sponsor-status"
              name="status"
              defaultValue={sponsor?.status ?? "Pledged"}
              className={inputClass}
            >
              <option>Pledged</option>
              <option>Paid</option>
            </select>
          </Field>
          <Field label="Website" htmlFor="sponsor-website">
            <input
              id="sponsor-website"
              name="website"
              type="url"
              placeholder="https://"
              defaultValue={sponsor?.website ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="In-kind note"
          htmlFor="sponsor-in-kind"
          hint="Goods or services given instead of cash. Internal only."
        >
          <input
            id="sponsor-in-kind"
            name="in_kind_note"
            type="text"
            defaultValue={sponsor?.in_kind_note ?? ""}
            className={inputClass}
          />
        </Field>

        <ImageUpload
          name="logo_path"
          initialPath={sponsor?.logo_path}
          label="Logo"
          hint="White or one-colour works best on the dark site. The sponsor's name is the alt text."
          previewClassName="h-[60px] w-[140px] bg-fir-900 object-contain p-2"
          folder="sponsors"
        />

        <SaveBar state={state} label={sponsor ? "Save sponsor" : "Add sponsor"}>
          <button
            type="button"
            onClick={onDone}
            className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            {state.status === "success" ? "Close" : "Cancel"}
          </button>
        </SaveBar>
      </form>

      {sponsor && (
        <form action={removeAction} className="flex items-center gap-3 border-t border-admin-rule pt-3">
          <input type="hidden" name="id" value={sponsor.id} />
          <button
            type="submit"
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-pill-warn-text underline"
          >
            Remove this sponsor
          </button>
          <Toast state={removeState} />
        </form>
      )}
    </div>
  );
}

function CopySponsors({ year }: { year: number }) {
  const [state, action] = useActionState(copyLastYearSponsors, IDLE);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="year" value={year} />
      <button
        type="submit"
        className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
      >
        Copy {year - 1} sponsors as Pledged
      </button>
      <Toast state={state} />
    </form>
  );
}

function SponsorshipForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState(saveSponsorshipForm, IDLE);
  const current = settings.sponsorship_form_path;

  return (
    <form action={action} className="flex flex-col gap-3 border-t border-admin-rule pt-3">
      <span className="text-[13px] font-semibold">Sponsorship form (PDF)</span>
      {current ? (
        <a
          href={imageUrl(current) ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-[13px] font-semibold underline"
        >
          View the form currently on the site
        </a>
      ) : (
        <span className="text-[13px] text-admin-muted">
          None uploaded — the Sponsorship page hides the download link until there is one.
        </span>
      )}
      <PdfUpload defaultPath={current} />
      <SaveBar state={state} label="Save form" />
    </form>
  );
}

function PdfUpload({ defaultPath }: { defaultPath: string | null }) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="sponsorship_form_path" value={path} />
      <label className="flex min-h-11 w-fit cursor-pointer items-center rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold">
        {busy ? "Uploading…" : "Upload new form"}
        <input
          type="file"
          accept="application/pdf"
          disabled={busy}
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              setError("That PDF is over 10 MB.");
              return;
            }
            setBusy(true);
            setError(null);
            const { createClient } = await import("@/lib/supabase/browser");
            const key = `forms/${crypto.randomUUID()}.pdf`;
            const { error: uploadError } = await createClient()
              .storage.from("odccc-media")
              .upload(key, file, { contentType: "application/pdf" });
            setBusy(false);
            if (uploadError) {
              setError(uploadError.message);
              return;
            }
            setPath(key);
          }}
        />
      </label>
      {path && path !== defaultPath && (
        <span className="text-[13px] font-semibold text-pill-ok-text">
          Uploaded — press Save form to put it on the site.
        </span>
      )}
      {error && (
        <p role="alert" className="m-0 text-[13px] font-semibold text-pill-warn-text">
          {error}
        </p>
      )}
    </div>
  );
}
