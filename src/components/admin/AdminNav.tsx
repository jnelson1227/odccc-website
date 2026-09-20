"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ADMIN_NAV = [
  { href: "/admin/event", label: "Event & homepage" },
  { href: "/admin/carvers", label: "Carvers" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/winners", label: "Past winners" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/admins", label: "Admins", ownerOnly: true },
] as const;

export default function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {ADMIN_NAV.filter((item) => !("ownerOnly" in item && item.ownerOnly) || isOwner).map(
        (item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-[10px] rounded-md px-[14px] py-3 text-[15px] no-underline ${
                active
                  ? "bg-gold font-bold text-brown"
                  : "bg-transparent font-medium text-cream hover:bg-cream/10"
              }`}
            >
              {item.label}
            </Link>
          );
        },
      )}
    </nav>
  );
}
