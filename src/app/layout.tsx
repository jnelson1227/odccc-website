import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders } from "next/font/google";
import "./globals.css";

// Google retired "Big Shoulders Display" and folded it into the Big Shoulders
// family — same typeface, current name. Weights 700 (eyebrows) and 900
// (headlines, numbers, names) per docs/02-design-system.md.
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-big-shoulders",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oregonccc.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Oregon Divisional Chainsaw Carving Championship",
    template: "%s — Oregon Divisional Chainsaw Carving Championship",
  },
  description:
    "Every Father's Day weekend at Rainbow Plaza in Reedsport, Oregon — four days of world-class chainsaw carving, daily Quick Carves and live auctions.",
  applicationName: "Oregon Divisional Chainsaw Carving Championship",
  openGraph: {
    type: "website",
    siteName: "Oregon Divisional Chainsaw Carving Championship",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10231a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
