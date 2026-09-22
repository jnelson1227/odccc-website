"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { applyAsCarver } from "@/app/actions/apply";
import PhotoUpload from "@/components/site/PhotoUpload";
import {
  CheckboxField,
  Fieldset,
  Honeypot,
  Labelled,
  RadioRow,
  TextArea,
  TextField,
  fieldClass,
} from "@/components/site/form";
import {
  DIVISIONS,
  QUICK_CARVE_COMFORT,
  SELLING_PAYMENT_METHODS,
  SHIRT_SIZES,
  carverSellingFee,
  money,
} from "@/lib/applications";
import { IDLE } from "@/lib/actions/state";

export default function CarverApplicationForm({
  year,
  sellingSpaceFee,
  setupLabel,
  contactEmail,
  contactPhone,
  contactAddress,
}: {
  year: number;
  sellingSpaceFee: number;
  /** "Wednesday, June 16" — the day before the event opens. */
  setupLabel: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
}) {
  const [state, formAction] = useActionState(applyAsCarver, IDLE);
  const [wantsSelling, setWantsSelling] = useState(false);
  const [sellingSpaces, setSellingSpaces] = useState(1);
  const [sellsOther, setSellsOther] = useState(false);
  const [payment, setPayment] = useState<string>("");

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-5 border border-gold bg-fir-850 px-6 py-8 md:px-10 md:py-10">
        <h2 className="display m-0 text-(length:--text-band-h2) font-black text-gold">
          Your application is in
        </h2>
        <p className="m-0 max-w-[60ch] text-[18px] leading-[1.6] text-body">
          The Chainsaw Committee reviews every application against the others in the same
          division, so this isn&apos;t first come, first served. You&apos;ll hear from the
          Chamber once the {year} field is settled. Submitting an application doesn&apos;t
          guarantee acceptance.
        </p>
        {contactEmail && (
          <p className="m-0 text-[16px] text-body">
            Questions in the meantime:{" "}
            <a href={`mailto:${contactEmail}`} className="font-bold text-gold">
              {contactEmail}
            </a>{" "}
            or call 541-271-3495.
          </p>
        )}
        <Link href="/carvers" className="btn-gold">
          See this year&apos;s carvers
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-12">
      <Honeypot />

      <Fieldset legend="Contact information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="first_name" label="First name" required autoComplete="given-name" maxLength={80} />
          <TextField name="last_name" label="Last name" required autoComplete="family-name" maxLength={80} />
        </div>
        <TextField
          name="street_address"
          label="Street address"
          required
          autoComplete="street-address"
          hint="The Chamber mails carver packets, so this needs to be somewhere post reaches you."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <TextField name="city" label="City" required autoComplete="address-level2" maxLength={100} />
          <TextField name="state" label="State" required autoComplete="address-level1" maxLength={60} />
          <TextField name="zip" label="ZIP" required autoComplete="postal-code" maxLength={20} inputMode="text" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="phone" label="Phone number" required type="tel" autoComplete="tel" inputMode="tel" maxLength={40} />
          <TextField name="email" label="Email address" required type="email" autoComplete="email" maxLength={254} />
        </div>
        <CheckboxField name="text_ok" label="Yes, the Chamber may contact me by text message" />
      </Fieldset>

      <Fieldset
        legend="Event information"
        hint="You choose your own division. The committee does not place carvers into divisions or move them once assigned — there are 30 Professional and 10 Semi-Professional positions."
      >
        <RadioRow name="division" legend="The division I am applying for" options={DIVISIONS} required />
        <RadioRow name="shirt_size" legend="T-shirt size" options={SHIRT_SIZES} required />
        <RadioRow
          name="quick_carve_comfort"
          legend="How comfortable are you with Quick Carves?"
          hint="Every event day has a 90-minute Quick Carve from 10:30 a.m. to noon. The pieces go into the live auction that evening and carvers keep 35% of the selling price."
          options={QUICK_CARVE_COMFORT}
          required
        />
        <TextArea
          name="experience"
          label="Tell us about your carving experience, and why you want to compete here"
          required
          rows={6}
          placeholder="Where you started, what you work in, shows you've competed at…"
        />
      </Fieldset>

      <Fieldset
        legend="Photos of your work"
        hint="Acceptance is based on the body of work you submit, compared with the other applicants in your division."
      >
        <PhotoUpload name="photo_paths" />
      </Fieldset>

      <Fieldset
        legend="Your announcement bio"
        hint={`If you're selected, this is what goes out in your carver announcement on Facebook and on your page on this site. You can leave it blank now and send it later — but the ones we have on hand get announced first.`}
      >
        <TextArea
          name="bio"
          label="Bio"
          rows={8}
          placeholder="Your carving background, your style, what you've won, where you're from and what inspires your work."
          hint="Write it the way you'd want it read out — we publish it close to as written."
        />
        <p className="m-0 max-w-[70ch] text-[15px] leading-[1.55] text-body">
          Where should people find you? Only what you want the public to see — these go on your
          page on this site if you&apos;re selected.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField
            name="website"
            label="Website"
            type="url"
            inputMode="url"
            maxLength={300}
            placeholder="https://"
            autoComplete="url"
          />
          <TextField
            name="facebook"
            label="Facebook"
            maxLength={300}
            placeholder="Paste the link to your page"
            hint="A full link is best — a page name alone can't be turned into one."
          />
          <TextField
            name="instagram"
            label="Instagram"
            maxLength={300}
            placeholder="@yourhandle"
            hint="Your handle or the link to your profile."
          />
        </div>
      </Fieldset>

      <Fieldset
        legend="Selling space"
        hint="Optional. You may display a few pieces in front of your carving booth for free. A dedicated selling space sits near your booth and is for finished carvings only — anything else needs the regular vendor application."
      >
        <CheckboxField
          name="wants_selling_space"
          label={`Yes, I'd like a 10' x 12' selling space for my carvings`}
          hint={`${money(sellingSpaceFee)} per space. There is no charge to carve — this fee is for the selling space only.`}
          onChange={setWantsSelling}
        />

        {wantsSelling && (
          <div className="flex flex-col gap-6 border-l-4 border-gold bg-fir-850 px-5 py-6 md:px-7">
            <div className="flex flex-col gap-3 text-[16px] leading-[1.6] text-body">
              <h3 className="display m-0 text-[22px] font-black text-cream">
                Fee schedule and information
              </h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                <Rule>
                  <strong className="text-cream">Booth size:</strong> 10&apos; selling front x 12&apos;
                  deep, near your carving booth. <strong className="text-cream">Cost:</strong>{" "}
                  {money(sellingSpaceFee)} for each 10&apos; storefront.
                </Rule>
                <Rule>
                  <strong className="text-cream">Set-up:</strong> {setupLabel}, 10 a.m. to 6 p.m.
                </Rule>
                <Rule>
                  10&apos; is the total length of your space. If any part of your booth goes over —
                  including the full length of a trailer and its tongue — you need another space.
                </Rule>
                <Rule>
                  Selling space is <strong className="text-cream">not guaranteed until paid in
                  full</strong>, and you may not set up until it is paid for or other arrangements
                  have been made with the Chainsaw Committee.
                </Rule>
                <Rule>
                  <strong className="text-cream">No refunds.</strong> Spaces are reserved only after
                  the application and full payment have been received and approved by the Chainsaw
                  Committee.
                </Rule>
              </ul>
            </div>

            <TextField name="selling_business_name" label="Business name" maxLength={150} />

            <Labelled label="Number of 10' x 12' spaces" required>
              {(id, describedBy) => (
                <select
                  id={id}
                  name="selling_spaces"
                  value={sellingSpaces}
                  onChange={(e) => setSellingSpaces(Number(e.target.value))}
                  aria-describedby={describedBy}
                  className={`${fieldClass} max-w-[200px]`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              )}
            </Labelled>

            <RadioRow
              name="sells_other_items"
              legend="Are you planning to sell any items other than carvings?"
              options={[
                { value: "no", label: "No — carvings only" },
                { value: "yes", label: "Yes" },
              ]}
              required
              onChange={(value) => setSellsOther(value === "yes")}
            />
            {sellsOther && (
              <TextField
                name="selling_other_items"
                label="What else will you sell?"
                required
                maxLength={500}
                hint="This space is for carvings only. To sell anything else you must also complete the regular vendor application — the Chamber will follow up with you."
              />
            )}

            <p className="m-0 text-[20px] font-bold text-gold">
              Selling space total: {money(carverSellingFee(sellingSpaceFee, sellingSpaces))}
              <span className="block text-[14px] font-normal text-sub">
                {sellingSpaces} space{sellingSpaces === 1 ? "" : "s"} x {money(sellingSpaceFee)}
              </span>
            </p>

            <RadioRow
              name="selling_payment_method"
              legend="How will you pay?"
              hint={`Checks and money orders are payable to the Reedsport/Winchester Bay Chamber of Commerce${contactAddress ? `, ${contactAddress}` : ""}. Please do not send cash.`}
              options={SELLING_PAYMENT_METHODS}
              required
              onChange={setPayment}
            />
            {payment === "check" && (
              <TextField
                name="selling_check_number"
                label="Check or money order number, if you have it"
                maxLength={40}
              />
            )}
            {payment === "card" && (
              <p className="m-0 text-[15px] leading-[1.55] text-body">
                Call the Chamber at {contactPhone ?? "541-271-3495"} to pay by card. Card payments
                carry a 3% processing fee.
              </p>
            )}
            {payment === "cash" && (
              <p className="m-0 text-[15px] leading-[1.55] text-body">
                Please call the Chamber at {contactPhone ?? "541-271-3495"} before the event to
                arrange paying in cash when you arrive.
              </p>
            )}

            <TextField
              name="selling_signature_name"
              label="Authorized signature — type your full name"
              required
              maxLength={120}
              autoComplete="name"
              hint="Typing your name here has the same effect as signing the selling space application."
            />

            {contactEmail && (
              <p className="m-0 text-[14px] leading-[1.55] text-sub">
                Questions, or paperwork to send along? Email{" "}
                <a href={`mailto:${contactEmail}`} className="font-bold text-gold">
                  {contactEmail}
                </a>
                {contactPhone && ` or call ${contactPhone}`}.
              </p>
            )}
          </div>
        )}
      </Fieldset>

      {state.status === "error" && (
        <p role="alert" className="m-0 border-l-4 border-gold bg-fir-850 px-5 py-4 text-[16px] font-bold text-gold">
          {state.message}
        </p>
      )}

      <div className="flex flex-col items-start gap-4">
        <Submit />
        <p className="m-0 max-w-[60ch] text-[14px] leading-[1.55] text-sub">
          A completed application is required every year, even for returning carvers. Applications
          are reviewed against the others in the same division rather than in the order they arrive,
          and submitting one does not guarantee acceptance.
        </p>
      </div>
    </form>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-[11px] h-[6px] w-[6px] shrink-0 bg-gold" />
      <span>{children}</span>
    </li>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-gold min-h-11 cursor-pointer border-none disabled:opacity-70">
      {pending ? "Sending your application…" : "Submit my application"}
    </button>
  );
}
