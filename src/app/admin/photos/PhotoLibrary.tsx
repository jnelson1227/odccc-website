"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveBar, { Toast } from "@/components/admin/SaveBar";
import { Card } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { deleteMedia, saveMedia } from "@/lib/actions/content";
import { imageUrl } from "@/lib/images";
import type { MediaItem } from "@/lib/types";

/**
 * A plain shelf of images the Chamber can reuse. Every image needs alt text
 * before it can be saved — that's the rule for every photo on this site.
 */
export default function PhotoLibrary({ media }: { media: MediaItem[] }) {
  const [state, action] = useActionState(saveMedia, IDLE);

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[400px_1fr]">
      <Card title="Add a photo" hint="Stored in the site's photo library so it can be reused.">
        <form key={state.status === "success" ? "reset" : "form"} action={action} className="flex flex-col gap-4">
          <ImageUpload
            name="path"
            altName="alt"
            label="Image"
            hint="Under 5 MB. JPG, PNG or WebP."
            requireAlt
            previewClassName="h-[120px] w-[120px] object-cover"
            folder="library"
          />
          <SaveBar state={state} label="Add to library" />
        </form>
      </Card>

      <Card title={`Photo library (${media.length})`}>
        {media.length === 0 ? (
          <p className="m-0 text-[14px] text-admin-muted">
            Nothing here yet. Photos uploaded on the Carvers and Sponsors screens live with those
            records; this library is for anything else worth keeping.
          </p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item) => (
              <li key={item.id} className="flex flex-col gap-2">
                {/* A row whose file has gone missing shouldn't crash the page. */}
                {imageUrl(item.path) ? (
                  <Image
                    src={imageUrl(item.path)!}
                    alt={item.alt}
                    width={240}
                    height={240}
                    unoptimized
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-admin-border text-[12px] text-admin-muted">
                    Image missing
                  </div>
                )}
                <span className="text-[12px] leading-snug text-admin-muted">{item.alt}</span>
                <Remove item={item} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Remove({ item }: { item: MediaItem }) {
  const [state, action] = useActionState(deleteMedia, IDLE);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-11 w-fit cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-pill-warn-text underline"
      >
        Remove
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="path" value={item.path} />
      <button
        type="submit"
        className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-bold text-pill-warn-text underline"
      >
        Really remove
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold underline"
      >
        Keep
      </button>
      <Toast state={state} />
    </form>
  );
}
