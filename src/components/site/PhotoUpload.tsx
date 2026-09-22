"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { signApplicationPhotoUpload } from "@/app/actions/apply";
import { createClient } from "@/lib/supabase/browser";
import { MAX_CARVER_PHOTOS, MIN_CARVER_PHOTOS } from "@/lib/applications";
import { imageUrl } from "@/lib/images";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic";

type Uploaded = { path: string; name: string };

/**
 * Photos of the applicant's work, uploaded straight to Supabase Storage.
 *
 * The applicant has no session and the bucket only lets admins write, so each
 * file gets a one-shot signed URL from the server first. The upload itself goes
 * browser → Storage, which also keeps a 9 MB photo off the phone-to-server path
 * a server action would have to squeeze it through.
 *
 * The resulting paths become hidden inputs, so the surrounding form submits
 * them like any other field — and the action re-checks each one against the
 * folder and shape it handed out.
 */
export default function PhotoUpload({ name }: { name: string }) {
  const [photos, setPhotos] = useState<Uploaded[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const statusId = useId();

  const full = photos.length >= MAX_CARVER_PHOTOS;

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = [...(event.target.files ?? [])];
    event.target.value = "";
    if (chosen.length === 0) return;

    const room = MAX_CARVER_PHOTOS - photos.length;
    if (room <= 0) return;

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const added: Uploaded[] = [];

    for (const file of chosen.slice(0, room)) {
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" is over 10 MB. Please shrink it and try again.`);
        continue;
      }

      const extension = file.name.split(".").pop() ?? "jpg";
      const signed = await signApplicationPhotoUpload(extension);
      if ("error" in signed) {
        setError(signed.error);
        continue;
      }

      const { error: uploadError } = await supabase.storage
        .from("odccc-media")
        .uploadToSignedUrl(signed.path, signed.token, file);

      if (uploadError) {
        setError(`We couldn't upload "${file.name}". Please try again.`);
        continue;
      }

      added.push({ path: signed.path, name: file.name });
    }

    setPhotos((current) => [...current, ...added]);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-[6px]">
        <span className="text-[14px] font-bold">
          Photos of your work
          <span aria-hidden="true" className="text-gold"> *</span>
          <span className="sr-only"> (required)</span>
        </span>
        <span id={statusId} className="text-[13px] leading-[1.45] text-sub">
          At least {MIN_CARVER_PHOTOS}, up to {MAX_CARVER_PHOTOS}. These are what the committee
          judges your application on, so send your best pieces. JPG, PNG, WEBP or HEIC, up to
          10 MB each.
        </span>
      </div>

      {photos.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.path} className="flex flex-col gap-2">
              <Image
                src={imageUrl(photo.path) ?? ""}
                alt={`Uploaded: ${photo.name}`}
                width={300}
                height={300}
                unoptimized
                className="aspect-square w-full border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotos((c) => c.filter((p) => p.path !== photo.path))}
                className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-bold text-gold underline"
              >
                Remove<span className="sr-only"> {photo.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label
          htmlFor={inputId}
          aria-disabled={busy || full}
          className={`flex min-h-11 w-fit items-center border-2 border-cream px-6 py-3 text-[16px] font-bold ${
            busy || full ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          {busy ? "Uploading…" : photos.length > 0 ? "Add another photo" : "Choose photos"}
        </label>
        <input
          id={inputId}
          type="file"
          accept={ACCEPT}
          multiple
          disabled={busy || full}
          onChange={onPick}
          aria-describedby={statusId}
          className="sr-only"
        />
        <span role="status" className="text-[14px] text-sub">
          {photos.length === 0
            ? "No photos yet"
            : `${photos.length} of ${MAX_CARVER_PHOTOS} added`}
          {full && " — that's the limit"}
        </span>
      </div>

      {error && (
        <p role="alert" className="m-0 text-[14px] font-bold text-gold">
          {error}
        </p>
      )}

      {photos.map((photo) => (
        <input key={photo.path} type="hidden" name={name} value={photo.path} />
      ))}
    </div>
  );
}
