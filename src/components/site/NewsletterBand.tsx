import SignupForm from "./SignupForm";

/** Sits above the footer on every page. `source` records which page signed them up. */
export default function NewsletterBand({ source }: { source: string }) {
  return (
    <section
      aria-labelledby="signup-h"
      className="mx-6 mb-12 grid grid-cols-1 items-center gap-8 border-2 border-gold bg-fir-850 px-6 py-10 md:mx-16 md:mb-[72px] md:px-12 md:py-11 lg:grid-cols-[1fr_1.15fr] lg:gap-12"
    >
      <div className="flex flex-col gap-[10px]">
        <div className="eyebrow">Stay in the loop</div>
        <h2
          id="signup-h"
          className="display m-0 text-(length:--text-signup-h2) font-black leading-[0.95]"
        >
          Get championship updates
        </h2>
        <p className="m-0 text-[17px] leading-[1.5] text-body">
          Carver announcements, the schedule, auction highlights and early passes — straight to
          your inbox.
        </p>
      </div>
      <SignupForm source={source} />
    </section>
  );
}
