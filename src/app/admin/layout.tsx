import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Site admin — ODCCC" },
  robots: { index: false, follow: false },
};

/**
 * The admin is a light UI inside a dark-themed site, so it sets its own
 * background and text colour rather than inheriting the public page's.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-admin-bg text-admin-text">{children}</div>;
}
