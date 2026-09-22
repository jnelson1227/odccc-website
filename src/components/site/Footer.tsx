import Image from "next/image";
import Link from "next/link";
import { applicationHref } from "@/lib/applications";
import type { Settings } from "@/lib/types";

/**
 * Contact details come from settings. The application links point at the
 * site's own forms unless the Chamber has pasted an outside link into settings.
 */
export default function Footer({ settings }: { settings: Settings }) {
  const carverApplication = applicationHref(settings, "carver");
  const vendorApplication = applicationHref(settings, "vendor");

  return (
    <footer
      id="contact"
      className="mt-auto grid grid-cols-1 gap-10 border-t border-line bg-fir-950 px-6 pb-10 pt-12 md:px-16 md:pt-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12"
    >
      <div className="flex flex-col gap-4">
        <Image
          src="/images/site/odccc-logo.png"
          alt="Oregon Divisional Chainsaw Carving Championship"
          width={296}
          height={197}
          className="h-[110px] w-auto object-contain"
        />
        <p className="m-0 max-w-md text-[14px] leading-[1.6] text-sub">
          Produced by the Reedsport/Winchester Bay Chamber of Commerce. Every Father&apos;s Day
          weekend at Rainbow Plaza, Reedsport — the Chainsaw Carving Capital of Oregon.
        </p>
      </div>

      <FooterColumn title="The Event">
        <FooterLink href="/schedule">Schedule</FooterLink>
        <FooterLink href="/carvers">Carvers</FooterLink>
        <FooterLink href="/our-story">History &amp; past winners</FooterLink>
      </FooterColumn>

      <FooterColumn title="Get Involved">
        <FooterLink href="/visit">Plan your visit</FooterLink>
        <FooterLink href="/sponsors">Our sponsors</FooterLink>
        <FooterLink href="/sponsorship">Become a sponsor</FooterLink>
        <FooterLink href={vendorApplication}>Vendor application</FooterLink>
        <FooterLink href={carverApplication}>Carver application</FooterLink>
      </FooterColumn>

      <FooterColumn title="Contact">
        {settings.contact_phone && (
          <a
            href={`tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`}
            className="flex min-h-11 items-center text-body no-underline transition-colors hover:text-gold"
          >
            Call {settings.contact_phone}
          </a>
        )}
        {settings.contact_text && (
          <a
            href={`sms:${settings.contact_text.replace(/[^\d+]/g, "")}`}
            className="flex min-h-11 items-center text-body no-underline transition-colors hover:text-gold"
          >
            Text {settings.contact_text}
          </a>
        )}
        {settings.contact_email && (
          <a
            href={`mailto:${settings.contact_email}`}
            className="flex min-h-11 items-center break-all text-body no-underline transition-colors hover:text-gold"
          >
            {settings.contact_email}
          </a>
        )}
        {settings.contact_address && (
          <span className="text-body">{settings.contact_address}</span>
        )}
      </FooterColumn>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-[15px]">
      <h2 className="display m-0 text-[20px] font-black text-gold">{title}</h2>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  const className =
    "flex min-h-11 items-center text-cream no-underline transition-colors hover:text-gold";

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
