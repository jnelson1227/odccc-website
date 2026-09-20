import Link from "next/link";

/** Gold eyebrow + H2 with a bottom hairline, and an optional gold link on the right. */
export default function SectionHead({
  eyebrow,
  title,
  id,
  link,
  children,
}: {
  eyebrow: string;
  title: string;
  id?: string;
  link?: { href: string; label: string; external?: boolean };
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex flex-col gap-2">
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="display m-0 text-(length:--text-section-h2) font-black leading-[0.95]">
          {id ? <span id={id}>{title}</span> : title}
        </h2>
      </div>
      {link &&
        (link.external ? (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center text-[16px] font-bold text-gold no-underline hover:underline"
          >
            {link.label}
          </a>
        ) : (
          <Link
            href={link.href}
            className="flex min-h-11 items-center text-[16px] font-bold text-gold no-underline hover:underline"
          >
            {link.label}
          </Link>
        ))}
      {children}
    </div>
  );
}
