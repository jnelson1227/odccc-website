"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { applyAsVendor } from "@/app/actions/apply";
import {
  CheckboxField,
  Fieldset,
  Honeypot,
  InfoPanel,
  Labelled,
  RadioRow,
  TextArea,
  TextField,
  fieldClass,
} from "@/components/site/form";
import {
  BOOTH_TYPES,
  WORKERS_COMP_OPTIONS,
  isFoodBooth,
  money,
  vendorFee,
  type FeeRates,
} from "@/lib/applications";
import { IDLE } from "@/lib/actions/state";
import type { BoothType } from "@/lib/types";

export default function VendorApplicationForm({
  year,
  rates,
  contactEmail,
}: {
  year: number;
  rates: FeeRates;
  contactEmail: string | null;
}) {
  const [state, formAction] = useActionState(applyAsVendor, IDLE);
  const [boothType, setBoothType] = useState<BoothType | "">("");
  const [chamberMember, setChamberMember] = useState(false);
  const [spaces, setSpaces] = useState(1);
  const [electrical, setElectrical] = useState(false);

  const food = isFoodBooth(boothType || null);
  const fee = boothType
    ? vendorFee(rates, { boothType, chamberMember, spaces, electrical: food && electrical })
    : null;

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-5 border border-gold bg-fir-850 px-6 py-8 md:px-10 md:py-10">
        <h2 className="display m-0 text-(length:--text-band-h2) font-black text-gold">
          Your application is in
        </h2>
        <p className="m-0 max-w-[60ch] text-[18px] leading-[1.6] text-body">
          Your space isn&apos;t reserved until the Chamber has your payment in full and the
          Chainsaw Committee has approved the application. Send a check or money order, or call
          541-271-3495 to pay by card.
        </p>
        {food && (
          <p className="m-0 max-w-[60ch] text-[16px] leading-[1.6] text-body">
            As a food vendor you also need a temporary restaurant license and a certificate of
            liability insurance naming the Chamber and the City of Reedsport as additional
            insured. Have your agent send it in now rather than bringing it with you — vendors
            without a correct certificate can&apos;t set up.
            {contactEmail && (
              <>
                {" "}
                Email it to{" "}
                <a href={`mailto:${contactEmail}`} className="font-bold text-gold">
                  {contactEmail}
                </a>
                .
              </>
            )}
          </p>
        )}
        {contactEmail && (
          <p className="m-0 text-[16px] text-body">
            Questions:{" "}
            <a href={`mailto:${contactEmail}`} className="font-bold text-gold">
              {contactEmail}
            </a>{" "}
            or call 541-271-3495.
          </p>
        )}
        <Link href="/visit" className="btn-gold">
          Plan your visit
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-12">
      <Honeypot />

      <Fieldset legend="Your business">
        <TextField name="business_name" label="Business or organization name" required maxLength={150} autoComplete="organization" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="first_name" label="Contact first name" required autoComplete="given-name" maxLength={80} />
          <TextField name="last_name" label="Contact last name" required autoComplete="family-name" maxLength={80} />
        </div>
        <TextField name="street_address" label="Street address" required autoComplete="street-address" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <TextField name="city" label="City" required autoComplete="address-level2" maxLength={100} />
          <TextField name="state" label="State" required autoComplete="address-level1" maxLength={60} />
          <TextField name="zip" label="ZIP" required autoComplete="postal-code" maxLength={20} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="phone" label="Phone number" required type="tel" autoComplete="tel" inputMode="tel" maxLength={40} />
          <TextField name="fax" label="Fax number" maxLength={40} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="email" label="Email address" required type="email" autoComplete="email" maxLength={254} />
          <TextField name="website" label="Website or Facebook page" maxLength={300} placeholder="example.com" />
        </div>
        <CheckboxField
          name="chamber_member"
          label="We're a Reedsport/Winchester Bay Chamber member"
          hint="Members pay a lower booth rate. The Chamber checks this against the membership list."
          onChange={setChamberMember}
        />
      </Fieldset>

      <Fieldset legend="Your booth">
        <RadioRow
          name="booth_type"
          legend="Booth type"
          options={BOOTH_TYPES}
          required
          onChange={(value) => setBoothType(value as BoothType)}
        />
        <TextArea
          name="items_for_sale"
          label="Describe the items you'll sell or exhibit"
          required
          rows={5}
          placeholder="List everything — kettle corn, hot dogs, bottled water…"
          hint="Only the items listed here may be sold at your booth. No beverages can be sold without the Chainsaw Committee's approval, and no alcohol without it either."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Labelled
            label="Number of 10' x 12' spaces"
            required
            hint={`10' is the total length of your space, including the full length of a trailer and its tongue. If any part of your booth goes over, you need another space.`}
          >
            {(id, describedBy) => (
              <select
                id={id}
                name="spaces"
                value={spaces}
                onChange={(e) => setSpaces(Number(e.target.value))}
                aria-describedby={describedBy}
                className={fieldClass}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
          </Labelled>
          <TextField
            name="near_vendor"
            label="Vendor you'd like to be near"
            maxLength={150}
            hint="Use their full name, and ask them to name you too — the committee places you both or neither."
          />
        </div>

        {food && (
          <div className="flex flex-col gap-4 border-l-4 border-gold bg-fir-850 px-5 py-5 md:px-6">
            <CheckboxField
              name="electrical"
              label="We need electrical service"
              hint={`${money(rates.vendor_fee_electrical)} per space, food vendors only. Bring your own 200 ft heavy-duty extension cord in excellent condition, plus tape to secure it.`}
              onChange={setElectrical}
            />
            {electrical && (
              <TextArea
                name="electrical_needs"
                label="What do you need to run?"
                rows={3}
                maxLength={500}
                placeholder="Two fryers, a warmer and a register"
              />
            )}
          </div>
        )}
      </Fieldset>

      <Fieldset legend="Fees">
        {fee ? (
          <div className="flex flex-col gap-3 border border-line bg-fir-850 px-5 py-5 md:px-6">
            <FeeLine
              label={`First space — ${boothType}${chamberMember ? ", Chamber member" : ""}`}
              amount={fee.baseRate}
            />
            {fee.additional > 0 && (
              <FeeLine label={`${spaces - 1} additional space${spaces - 1 === 1 ? "" : "s"}`} amount={fee.additional} />
            )}
            {fee.electrical > 0 && <FeeLine label="Electrical service" amount={fee.electrical} />}
            <p className="m-0 flex items-baseline justify-between gap-4 border-t border-line pt-3 text-[20px] font-bold text-gold">
              <span>Total due</span>
              <span>{money(fee.total)}</span>
            </p>
          </div>
        ) : (
          <p className="m-0 text-[16px] text-sub">Choose a booth type and your fee appears here.</p>
        )}

        <InfoPanel title="How to pay">
          <p className="m-0">
            Send a check or money order made out to the Reedsport/Winchester Bay Chamber of
            Commerce, 2741 Frontage Road, Reedsport, OR 97467. Please don&apos;t send cash. To pay
            by card, call 541-271-3495 — card payments carry a 3% processing fee.
          </p>
          {contactEmail && (
            <p className="m-0">
              Insurance certificates and any other paperwork can be emailed to{" "}
              <a href={`mailto:${contactEmail}`} className="font-bold text-gold">
                {contactEmail}
              </a>
              .
            </p>
          )}
          <p className="m-0">
            <strong className="text-cream">There are no refunds</strong>, and a space is only
            reserved once the application and full payment are in and the Chainsaw Committee has
            approved it.
          </p>
          <p className="m-0">
            Each space comes with two all-event wristbands. Extra wristbands are $10 per person per
            day or $30 for the whole event, bought at check-in.
          </p>
        </InfoPanel>
      </Fieldset>

      <Fieldset
        legend="Workers' compensation"
        hint="Douglas County requires a signed statement from every participant under ORS 656, as a condition of the event's special use permit. Everyone answers this."
      >
        <RadioRow
          name="workers_comp"
          legend={`For all Chamber ${year} events`}
          options={WORKERS_COMP_OPTIONS}
          required
        />
        <p className="m-0 max-w-[70ch] text-[15px] leading-[1.55] text-body">
          If you employ subject workers, have your insurance agent send proof of coverage before the
          event
          {contactEmail ? (
            <>
              {" "}
              to{" "}
              <a href={`mailto:${contactEmail}`} className="font-bold text-gold">
                {contactEmail}
              </a>
              , or by mail
            </>
          ) : null}{" "}
          to the Chamber at 2741 Frontage Road, Reedsport, OR 97467.
        </p>
      </Fieldset>

      <Fieldset legend="Agreements">
        <InfoPanel title="What you're agreeing to">
          <p className="m-0">
            <strong className="text-cream">Terms and conditions.</strong> No refunds. You may sell
            only the items described above, from the space the committee assigns. No vehicles in the
            event grounds during the event, and none in the event space after 8 a.m. Booths open by
            9 a.m. daily and stay open until the ticket booth closes. Keep your space clean, break
            down cardboard, and take everything with you when the event ends. You indemnify the
            Chamber for claims arising from your activities at the booth. Food vendors must hold a
            temporary restaurant license and carry commercial general liability insurance naming the
            Chamber and the City of Reedsport as additional insured.
          </p>
          <p className="m-0">
            <strong className="text-cream">Code of conduct.</strong> Comply with the law and with
            reasonable direction from Chamber representatives, protect the local environment, and
            deal honestly with the Chamber and with the public. Failure to comply can mean dismissal
            from the event without a refund and exclusion from future ones.
          </p>
          <p className="m-0">
            <strong className="text-cream">Waiver of liability.</strong> You accept the risks of
            taking part, including illness, and release the ODCCC and its officers, employees and
            agents from related claims. You confirm you are at least 18 and are signing freely, and
            the agreement is governed by Oregon law.
          </p>
          <p className="m-0 text-sub">
            The full printed terms are available from the Chamber on request — call 541-271-3495 and
            we&apos;ll send them.
          </p>
        </InfoPanel>

        <CheckboxField name="agrees_terms" label="I have read and agree to the terms and conditions" required />
        <CheckboxField name="agrees_code_of_conduct" label="I have read and agree to the code of conduct" required />
        <CheckboxField name="agrees_waiver" label="I have read and agree to the waiver of liability and hold harmless agreement" required />

        <TextField
          name="signature_name"
          label="Type your full name to sign"
          required
          maxLength={120}
          autoComplete="name"
          hint="Typing your name here has the same effect as signing the printed application. You confirm you're authorised to sign for the business named above."
        />
      </Fieldset>

      {state.status === "error" && (
        <p role="alert" className="m-0 border-l-4 border-gold bg-fir-850 px-5 py-4 text-[16px] font-bold text-gold">
          {state.message}
        </p>
      )}

      <div className="flex flex-col items-start gap-4">
        <Submit />
        <p className="m-0 max-w-[60ch] text-[14px] leading-[1.55] text-sub">
          Your application is a contract. If you share a space with someone who isn&apos;t immediate
          family, the Chamber needs an application from them too.
        </p>
      </div>
    </form>
  );
}

function FeeLine({ label, amount }: { label: string; amount: number }) {
  return (
    <p className="m-0 flex items-baseline justify-between gap-4 text-[16px] text-body">
      <span>{label}</span>
      <span className="font-bold text-cream">{money(amount)}</span>
    </p>
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
