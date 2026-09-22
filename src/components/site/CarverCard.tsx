import Image from "next/image";
import Link from "next/link";
import { imageUrl, initials } from "@/lib/images";
import type { Carver } from "@/lib/types";

type Variant = "home" | "grid";

/**
 * A carver photo with a 2px line border, an optional gold honor badge, the
 * carver's name, hometown and one-line card line. Carvers without a photo get
 * an initials placeholder rather than a broken image.
 *
 * The Carvers grid leads with the portrait the carver submitted, in a tall 2:3
 * frame that suits a person standing beside their work; the homepage row keeps
 * the sculpture, as in design-reference/Home.dc.html.
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
  const isHome = variant === "home";

  // A carver with no portrait falls back to their sculpture, so the grid never
  // goes to the initials placeholder while a usable photo exists.
  const portrait = !isHome && carver.portrait_path;
  const src = imageUrl(portrait ? carver.portrait_path : carver.photo_path);
  const alt = portrait
    ? (carver.portrait_alt ?? carver.name)
    : (carver.photo_alt ?? `Sculpture by ${carver.name}`);

  const frame = isHome
    ? "h-[220px] sm:h-[260px] lg:h-[300px]"
    : "aspect-2/3";

  return (
    <Link
      href={`/carvers/${carver.slug}`}
      className="group flex flex-col gap-3 text-cream no-underline"
    >
      <div className={`relative w-full ${frame}`}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            // Centred rather than top-anchored: in these photos the carver
            // stands beside work that is often taller than they are, so their
            // face lands anywhere from the top third to the middle.
            className="border-2 border-line object-cover object-center transition-[border-color] group-hover:border-gold"
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
