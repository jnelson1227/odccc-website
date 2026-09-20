import Footer from "@/components/site/Footer";
import { getEventContext } from "@/lib/queries";

/** Every public page: content, then the shared footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getEventContext();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-brown"
      >
        Skip to content
      </a>
      {children}
      <Footer settings={settings} />
    </div>
  );
}
