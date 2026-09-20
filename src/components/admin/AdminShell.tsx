import Image from "next/image";
import Link from "next/link";
import AdminNav from "./AdminNav";
import SignOutButton from "./SignOutButton";
import type { SignedInAdmin } from "@/lib/auth";

const SAVED_AT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles",
});

/**
 * Sidebar, top bar and content column. There's no draft/publish workflow in
 * v1, so the top bar says changes go live on save and offers "View site"
 * where the mockup had "Publish changes".
 */
export default function AdminShell({
  admin,
  title,
  lastSaved,
  children,
}: {
  admin: SignedInAdmin;
  title: string;
  /** settings.updated_at, so "last saved" is a real timestamp rather than a guess. */
  lastSaved?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-7 bg-fir-900 p-4 pt-6 text-cream">
        <Link href="/admin/event" className="flex flex-col items-start gap-[10px] px-[6px] no-underline">
          <Image
            src="/images/site/odccc-logo.png"
            alt="ODCCC"
            width={296}
            height={197}
            className="h-16 w-auto object-contain"
          />
          <span className="text-[12px] font-bold uppercase tracking-[2px] text-sub">
            Site admin
          </span>
        </Link>

        <AdminNav isOwner={admin.role === "owner"} />

        <div className="mt-auto flex flex-col gap-2 border-t border-cream/15 px-[6px] pt-4">
          <span className="text-[13px] font-semibold break-all">{admin.email}</span>
          <span className="text-[12px] uppercase tracking-[1px] text-sub">{admin.role}</span>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-3 border-b border-admin-border bg-admin-card px-5 py-5 md:flex-row md:items-center md:justify-between md:px-9">
          <div className="flex flex-col gap-1">
            <h1 className="display m-0 text-[30px] font-black uppercase leading-none md:text-[34px]">
              {title}
            </h1>
            <span className="text-[13px] text-admin-muted">
              Changes go live on the site as soon as you save
              {lastSaved ? ` · Last saved ${SAVED_AT.format(new Date(lastSaved))}` : ""}
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex min-h-11 w-fit items-center rounded-md border border-admin-border px-[18px] py-3 text-[15px] font-semibold text-admin-text no-underline"
          >
            View site
          </Link>
        </div>

        <div className="flex flex-grow flex-col gap-5 px-5 py-6 md:px-9 md:py-7">{children}</div>
      </main>
    </div>
  );
}
