import Image from "next/image";

/**
 * The 380px photo banner at the top of every page but the homepage:
 * a desaturated wide crop under a fir wash, with a gold eyebrow and a huge H1.
 */
export default function PageHeader({
  image,
  eyebrow,
  title,
  intro,
}: {
  image: string;
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="relative flex min-h-[260px] flex-col justify-end overflow-hidden md:h-[380px]">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-fir-900 opacity-[0.78]" />
      <div className="relative flex flex-col gap-4 px-6 pb-10 pt-16 md:px-16 md:pb-14">
        <div className="display flex items-center gap-4 text-(length:--text-eyebrow-lg) font-bold tracking-[2px] text-gold">
          <span aria-hidden="true" className="h-1 w-8 shrink-0 bg-gold md:w-12" />
          {eyebrow}
        </div>
        <h1 className="display m-0 text-(length:--text-page-h1) font-black leading-[0.85]">
          {title}
        </h1>
        <p className="m-0 max-w-[820px] text-(length:--text-subtitle) leading-[1.45] text-body text-pretty">
          {intro}
        </p>
      </div>
    </header>
  );
}
