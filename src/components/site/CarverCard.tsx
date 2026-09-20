import Image from "next/image";
import Link from "next/link";
import { imageUrl, initials } from "@/lib/images";
import type { Carver } from "@/lib/types";

type Variant = "home" | "grid";

/**
 * 3:4 sculpture photo with a 2px line border, an optional gold honor badge,
 * the carver's name, hometown and one-line card line. Carvers without a photo
 * get an initials placeholder rather than a broken image.
 */
export default function CarverCard({
  carver,
  variant = "grid",
  priority = false,
}: {
  carver: Carver;
  variant?: Variant;
  priority?: boolean;
}) {
  const src = imageUrl(carver.photo_path);
  const isHome = variant === "home";
  const height = isHome ? "h-[220px] sm:h-[260px] lg:h-[300px]" : "h-[220px] sm:h-[250px] lg:h-[280px]";

  return (
    <Link
      href={`/carvers/${carver.slug}`}
      className="group flex flex-col gap-3 text-cream no-underline"
    >
      <div className={`relative w-full ${height}`}>
        {src ? (
          <Image
            src={src}
            alt={carver.photo_alt ?? `Sculpture by ${carver.name}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="border-2 border-line object-cover transition-[border-color] group-hover:border-gold"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line bg-fir-850 transition-[border-color] group-hover:border-gold">
            <span aria-hidden="true" className="display text-[56px] font-black text-placeholder">
              {initials(carver.name)}
            </span>
            <span className="text-[11px] uppercase tracking-[1.5px] text-sub">Photo coming</span>
          </div>
        )}

        {/* The badge belongs to the Carvers-page card; the homepage row uses the
            gold card line instead, as in design-reference/Home.dc.html. */}
        {!isHome && carver.honor_badge && (
          <span className="absolute left-0 top-0 bg-gold px-2 py-1 text-[11px] font-bold uppercase tracking-[1.5px] text-brown">
            {carver.honor_badge}
          </span>
        )}
      </div>

      <span className="flex flex-col gap-[5px]">
        <span
          className={`display font-black leading-none transition-colors group-hover:text-gold ${
            isHome ? "text-[22px] lg:text-[26px]" : "text-[21px] lg:text-[24px]"
          }`}
        >
          {carver.name}
        </span>
        {carver.hometown && (
          <span
            className={
              isHome ? "text-[14px] text-sub" : "text-[14px] font-bold text-gold"
            }
          >
            {carver.hometown}
          </span>
        )}
        {carver.card_line && (
          <span
            className={
              isHome
                ? "text-[12px] font-bold uppercase leading-snug tracking-[1.5px] text-gold"
                : "text-[14px] leading-[1.45] text-body"
            }
          >
            {carver.card_line}
          </span>
        )}
      </span>
    </Link>
  );
}
