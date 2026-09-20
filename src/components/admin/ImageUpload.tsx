"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { imageUrl } from "@/lib/images";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/svg+xml";

/**
 * Uploads to the `odccc-media` bucket straight from the browser, using the
 * volunteer's own session — storage RLS only lets admins write. The resulting
 * path goes into a hidden input, so the surrounding form saves it like any
 * other field.
 *
 * Alt text is required for sculpture and carver photos. A logo used as a link
 * gets its alt from the sponsor's name instead, so `requireAlt` is off there.
 */
export default function ImageUpload({
  name,
  altName,
  initialPath,
  initialAlt,
  label,
  hint,
  requireAlt = false,
  previewClassName = "h-[120px] w-[96px] object-cover",
  folder = "uploads",
}: {
  name: string;
  altName?: string;
  initialPath?: string | null;
  initialAlt?: string | null;
  label: string;
  hint?: string;
  requireAlt?: boolean;
  previewClassName?: string;
  folder?: string;
}) {
  const [path, setPath] = useState(initialPath ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileId = useId();
  const altId = useId();

  const preview = imageUrl(path);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError("That image is over 5 MB. Please shrink it and try again.");
      event.target.value = "";
      return;
    }

    setBusy(true);
    setError(null);

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const key = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await createClient()
      .storage.from("odccc-media")
      .upload(key, file, { cacheControl: "31536000", upsert: false });

    setBusy(false);

    if (uploadError) {
      setError(uploadError.message);
      event.target.value = "";
      return;
    }
    setPath(key);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13px] font-semibold">{label}</span>

      <div className="flex items-start gap-4">
        {preview ? (
          <Image
            src={preview}
            alt=""
            width={200}
            height={250}
            unoptimized
            className={`rounded-md ${previewClassName}`}
          />
        ) : (
          <div
            className={`flex items-center justify-center rounded-md border border-dashed border-admin-border text-[12px] text-admin-muted ${previewClassName}`}
          >
            No image
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor={fileId}
            className="flex min-h-11 w-fit cursor-pointer items-center rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            {busy ? "Uploading…" : path ? "Replace image" : "Upload image"}
          </label>
          <input
            id={fileId}
            type="file"
            accept={ACCEPT}
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />
          {hint && <span className="text-[12px] text-admin-muted">{hint}</span>}
          {path && (
            <button
              type="button"
              onClick={() => setPath("")}
              className="w-fit cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-pill-warn-text underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="m-0 text-[13px] font-semibold text-pill-warn-text">
          {error}
        </p>
      )}

      <input type="hidden" name={name} value={path} />

      {altName && (
        <div className="flex flex-col gap-[6px]">
          <label htmlFor={altId} className="text-[13px] font-semibold">
            Alt text{requireAlt && <span aria-hidden="true"> *</span>}
            {requireAlt && <span className="sr-only"> (required)</span>}
          </label>
          <input
            id={altId}
            name={altName}
            type="text"
            defaultValue={initialAlt ?? ""}
            required={requireAlt && Boolean(path)}
            maxLength={200}
            placeholder="Carved deer and fawns rising from a stump"
            className="min-h-11 w-full rounded-md border border-admin-border bg-white px-3 py-[10px] text-[15px]"
          />
          <span className="text-[12px] text-admin-muted">
            Describe what the photo shows, for people using a screen reader and for search.
          </span>
        </div>
      )}
    </div>
  );
}
