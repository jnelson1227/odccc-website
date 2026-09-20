import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { editionLabel, formatRange, resolveEventDates } from "@/lib/dates";
import { publicClient } from "@/lib/supabase/public";

export const alt = "Oregon Divisional Chainsaw Carving Championship — Reedsport, Oregon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The default sharing card: the logo on Dark Fir with this year's dates.
 * Most visitors arrive from a shared link, so this is the first thing many
 * people see of the championship.
 */
export default async function OpengraphImage() {
  const { data } = await publicClient
    .from("settings")
    .select("event_year, date_override_start, date_override_end")
    .eq("id", 1)
    .single();

  const year = data?.event_year ?? new Date().getUTCFullYear();
  const dates = resolveEventDates(year, data?.date_override_start, data?.date_override_end);

  const logo = await readFile(
    path.join(process.cwd(), "public", "images", "site", "odccc-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
          background: "#10231a",
          padding: 64,
        }}
      >
        {/* next/image can't be used inside an ImageResponse — this renders in Satori. */}
        <img src={logoSrc} alt="" width={520} height={346} style={{ objectFit: "contain" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#dca93e",
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 56, height: 4, background: "#dca93e" }} />
          {editionLabel(year)} · {formatRange(dates)}
        </div>
        <div style={{ color: "#d2cdbb", fontSize: 30, letterSpacing: 2 }}>
          Rainbow Plaza · Reedsport, Oregon
        </div>
      </div>
    ),
    size,
  );
}
