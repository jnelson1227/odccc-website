"use client";

import { useActionState, useState } from "react";
import FeaturedCarverPicker from "@/components/admin/FeaturedCarverPicker";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveBar from "@/components/admin/SaveBar";
import { Card, Field, Locked, inputClass, textareaClass } from "@/components/admin/ui";
import { editionLabel, eventDates, formatRangeLong, toISODate } from "@/lib/dates";
import { IDLE } from "@/lib/actions/state";
import { saveSettings } from "@/lib/actions/settings";
import type { Carver, Settings, Sponsor } from "@/lib/types";

export default function EventForm({
  settings,
  carvers,
  presentingCandidates,
}: {
  settings: Settings;
  carvers: Carver[];
  presentingCandidates: Sponsor[];
}) {
  const [state, action] = useActionState(saveSettings, IDLE);

  // Year, edition and dates update together as soon as the year changes, so a
  // volunteer can see what they're about to save before they save it.
  const [year, setYear] = useState(settings.event_year);
  const [overriding, setOverriding] = useState(
    Boolean(settings.date_override_start && settings.date_override_end),
  );
  const [wash, setWash] = useState(Number(settings.hero_wash ?? 0.8));
  const [presenting, setPresenting] = useState(settings.presenting_enabled);

  const computed = eventDates(year);
  const yearOptions = Array.from({ length: 7 }, (_, i) => settings.event_year - 1 + i);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_1.25fr_0.9fr]">
        {/* ---------------------------------------------- left column */}
        <div className="flex flex-col gap-5">
          <Card
            title="This year's championship"
            hint="Pick the year — edition number and dates fill in automatically."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Year" htmlFor="event_year">
                <select
                  id="event_year"
                  name="event_year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={inputClass}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] font-semibold">Edition</span>
                <Locked value={editionLabel(year)} tag="Auto" />
              </div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] font-semibold">Dates</span>
              <Locked
                value={formatRangeLong(computed)}
                tag="Father's Day weekend"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] font-semibold">Location</span>
              <Locked value="Rainbow Plaza · Reedsport, Oregon" tag="Always" />
            </div>

            <label
              htmlFor="override_dates"
              className="flex min-h-11 items-center gap-3 text-[14px] font-semibold"
            >
              <input
                id="override_dates"
                name="override_dates"
                type="checkbox"
                checked={overriding}
                onChange={(e) => setOverriding(e.target.checked)}
                className="h-[18px] w-[18px] shrink-0 accent-fir-900"
              />
              <span className="flex flex-col gap-[2px]">
                Override dates this year
                <span className="text-[12px] font-normal text-admin-muted">
                  Only if the championship ever moves off Father&apos;s Day weekend
                </span>
              </span>
            </label>

            {overriding && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Starts" htmlFor="date_override_start">
                  <input
                    id="date_override_start"
                    name="date_override_start"
                    type="date"
                    defaultValue={settings.date_override_start ?? toISODate(computed.start)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Ends" htmlFor="date_override_end">
                  <input
                    id="date_override_end"
                    name="date_override_end"
                    type="date"
                    defaultValue={settings.date_override_end ?? toISODate(computed.end)}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </Card>

          <Card title="Admission">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Daily admission" htmlFor="admission_daily">
                <input
                  id="admission_daily"
                  name="admission_daily"
                  type="text"
                  defaultValue={settings.admission_daily ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="4-day pass" htmlFor="admission_pass">
                <input
                  id="admission_pass"
                  name="admission_pass"
                  type="text"
                  defaultValue={settings.admission_pass ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Gates open" htmlFor="gate_open_time">
              <input
                id="gate_open_time"
                name="gate_open_time"
                type="text"
                defaultValue={settings.gate_open_time ?? ""}
                className={inputClass}
              />
            </Field>
            <Field
              label="Ticket / pass link"
              htmlFor="ticket_url"
              hint="Leave blank until online sales are set up — the site then points people to the gate instead."
            >
              <input
                id="ticket_url"
                name="ticket_url"
                type="url"
                inputMode="url"
                placeholder="https://"
                defaultValue={settings.ticket_url ?? ""}
                className={inputClass}
              />
            </Field>
          </Card>
        </div>

        {/* ---------------------------------------------- middle column */}
        <div className="flex flex-col gap-5">
          <Card
            title="Homepage hero"
            hint="Bold words in the paragraphs: wrap them in **double stars**."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Headline line 1" htmlFor="hero_line1">
                <input
                  id="hero_line1"
                  name="hero_line1"
                  type="text"
                  defaultValue={settings.hero_line1 ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Line 2 (gold)" htmlFor="hero_line2">
                <input
                  id="hero_line2"
                  name="hero_line2"
                  type="text"
                  defaultValue={settings.hero_line2 ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Line 3" htmlFor="hero_line3">
                <input
                  id="hero_line3"
                  name="hero_line3"
                  type="text"
                  defaultValue={settings.hero_line3 ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Paragraph 1" htmlFor="hero_para1">
              <textarea
                id="hero_para1"
                name="hero_para1"
                rows={3}
                defaultValue={settings.hero_para1 ?? ""}
                className={textareaClass}
              />
            </Field>
            <Field label="Paragraph 2" htmlFor="hero_para2">
              <textarea
                id="hero_para2"
                name="hero_para2"
                rows={3}
                defaultValue={settings.hero_para2 ?? ""}
                className={textareaClass}
              />
            </Field>

            <ImageUpload
              name="hero_bg_path"
              label="Background photo"
              initialPath={settings.hero_bg_path}
              hint="A wide, desaturated shot works best. Under 5 MB."
              previewClassName="h-[75px] w-[120px] object-cover"
              folder="hero"
            />

            <Field
              label={`Wash over the photo — ${wash.toFixed(2)}`}
              htmlFor="hero_wash"
              hint="Higher is darker. The headline has to stay easy to read."
            >
              <input
                id="hero_wash"
                name="hero_wash"
                type="range"
                min={0.5}
                max={0.95}
                step={0.01}
                value={wash}
                onChange={(e) => setWash(Number(e.target.value))}
                className="h-11 w-full accent-fir-900"
              />
            </Field>
          </Card>

          <Card title="More settings" hint="Contact details, links and page copy.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="contact_phone">
                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  defaultValue={settings.contact_phone ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Text" htmlFor="contact_text">
                <input
                  id="contact_text"
                  name="contact_text"
                  type="tel"
                  defaultValue={settings.contact_text ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="contact_email">
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={settings.contact_email ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Address" htmlFor="contact_address">
                <input
                  id="contact_address"
                  name="contact_address"
                  type="text"
                  defaultValue={settings.contact_address ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Parking"
              htmlFor="parking_copy"
              hint="Shown on the Visit page. Until it's filled in, the page says details are being confirmed."
            >
              <textarea
                id="parking_copy"
                name="parking_copy"
                rows={2}
                defaultValue={settings.parking_copy ?? ""}
                className={textareaClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Visit Reedsport link" htmlFor="visit_reedsport_url">
                <input
                  id="visit_reedsport_url"
                  name="visit_reedsport_url"
                  type="url"
                  placeholder="https://"
                  defaultValue={settings.visit_reedsport_url ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Visitors (sponsorship stat)" htmlFor="stat_visitors">
                <input
                  id="stat_visitors"
                  name="stat_visitors"
                  type="text"
                  defaultValue={settings.stat_visitors ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Carver application link" htmlFor="carver_application_url">
                <input
                  id="carver_application_url"
                  name="carver_application_url"
                  type="url"
                  placeholder="https://"
                  defaultValue={settings.carver_application_url ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Vendor application link" htmlFor="vendor_application_url">
                <input
                  id="vendor_application_url"
                  name="vendor_application_url"
                  type="url"
                  placeholder="https://"
                  defaultValue={settings.vendor_application_url ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Carvers page"
              htmlFor="carvers_page_mode"
              hint={`"Last year's" shows the ${year - 1} field with a "coming soon" note until the ${year} lineup is set.`}
            >
              <select
                id="carvers_page_mode"
                name="carvers_page_mode"
                defaultValue={settings.carvers_page_mode}
                className={inputClass}
              >
                <option value="current">Show this year&apos;s lineup ({year})</option>
                <option value="previous">
                  Show last year&apos;s lineup ({year - 1}) — {year} coming soon
                </option>
              </select>
            </Field>
          </Card>
        </div>

        {/* ---------------------------------------------- right column */}
        <div className="flex flex-col gap-5">
          <Card title="Presenting sponsor" hint="Appears under the championship logo.">
            <label
              htmlFor="presenting_enabled"
              className="flex min-h-11 items-center gap-3 text-[14px] font-semibold"
            >
              <input
                id="presenting_enabled"
                name="presenting_enabled"
                type="checkbox"
                checked={presenting}
                onChange={(e) => setPresenting(e.target.checked)}
                className="h-[18px] w-[18px] shrink-0 accent-fir-900"
              />
              <span className="flex flex-col gap-[2px]">
                Show &ldquo;Presented by&rdquo; on the homepage
                <span className="text-[12px] font-normal text-admin-muted">
                  Off until a presenting sponsor signs on
                </span>
              </span>
            </label>

            <Field label="Presenting sponsor" htmlFor="presenting_sponsor_id">
              <select
                id="presenting_sponsor_id"
                name="presenting_sponsor_id"
                defaultValue={settings.presenting_sponsor_id ?? ""}
                className={inputClass}
              >
                <option value="">— None yet —</option>
                {presentingCandidates.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </Field>

            {presentingCandidates.length === 0 && (
              <p className="m-0 text-[13px] text-admin-muted">
                No {year} sponsor is at the Presenting level yet. Add one under Sponsors first.
              </p>
            )}
          </Card>

          <Card
            title="Featured carvers"
            hint="The six cards in &ldquo;Meet the carvers&rdquo; on the homepage, in order."
          >
            <FeaturedCarverPicker
              carvers={carvers}
              initialIds={settings.featured_carver_ids ?? []}
            />
          </Card>
        </div>
      </div>

      <Card className="sticky bottom-4 shadow-lg">
        <SaveBar state={state} />
      </Card>
    </form>
  );
}
