"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { NAV_LINKS, type NavKey } from "./nav-links";

type Props = {
  /** "June 17–20, 2027" */
  dateLabel: string;
  passesHref: string;
  active?: NavKey;
  /**
   * The homepage nav sits on top of the hero photo and leads with a text
   * lockup instead of the logo, because the logo is the hero's own <h1>.
   */
  variant?: "page" | "hero";
};

export default function SiteNav({ dateLabel, passesHref, active, variant = "page" }: Props) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const isHero = variant === "hero";

  // Don't leave a phone menu hanging open behind a new page.
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <nav
      aria-label="Primary"
      className={
        isHero
          ? "relative border-b border-cream/20"
          : "relative z-30 border-b border-cream/20 bg-fir-900"
      }
    >
      <div
        className={`flex items-center justify-between gap-4 px-6 md:px-16 ${
          isHero ? "py-5 md:py-[26px]" : "py-3 md:py-[14px]"
        }`}
      >
        {isHero ? (
          <span className="display max-w-[16rem] text-[13px] font-bold leading-tight tracking-[3px] text-sub sm:max-w-none md:text-[16px]">
            Reedsport · The Chainsaw Carving Capital of Oregon
          </span>
        ) : (
          <Link href="/" aria-label="Home" className="flex items-center gap-4 no-underline">
            <Image
              src="/images/site/odccc-logo.png"
              alt="Oregon Divisional Chainsaw Carving Championship"
              width={296}
              height={197}
              priority
              className="h-12 w-auto object-contain md:h-[70px]"
            />
            <span className="display text-[12px] font-bold leading-[1.3] tracking-[3px] text-sub md:text-[15px]">
              {dateLabel}
              <br />
              Reedsport, Oregon
            </span>
          </Link>
        )}

        {/* Desktop links */}
        <div className="hidden items-center gap-9 text-[15px] font-medium lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active === link.key ? "page" : undefined}
              className={
                active === link.key
                  ? "border-b-2 border-gold pb-1 text-gold no-underline"
                  : "text-cream no-underline transition-colors hover:text-gold"
              }
            >
              {link.label}
            </Link>
          ))}
          <PassesLink href={passesHref} />
        </div>

        {/* Phone menu button — 44px tap target */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 min-w-11 items-center gap-2 border border-cream/30 px-3 text-[13px] font-bold uppercase tracking-[2px] text-cream lg:hidden"
        >
          <span aria-hidden="true" className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-5 bg-cream" />
            <span className="block h-[2px] w-5 bg-cream" />
            <span className="block h-[2px] w-5 bg-cream" />
          </span>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          id={menuId}
          className="flex flex-col gap-1 border-t border-line bg-fir-900 px-6 pb-6 pt-2 lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={active === link.key ? "page" : undefined}
              className={`flex min-h-11 items-center border-b border-line text-[17px] font-medium no-underline ${
                active === link.key ? "text-gold" : "text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <PassesLink href={passesHref} className="mt-4 w-full" onClick={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function PassesLink({
  href,
  className = "",
  onClick,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
}) {
  const external = href.startsWith("http");
  const classes = `flex min-h-11 items-center justify-center rounded-[2px] bg-cream px-[22px] py-[13px] text-[15px] font-bold text-fir-900 no-underline transition-colors hover:bg-gold hover:text-brown ${className}`;

  if (external) {
    return (
      <a href={href} className={classes} onClick={onClick} rel="noopener">
        Get Passes
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      Get Passes
    </Link>
  );
}
