"use client";

import { useId } from "react";

/**
 * Form controls for the dark public pages — the application forms are the only
 * long forms on the site, and they need to look like the rest of it.
 *
 * Everything here is a real label tied to a real control, and every group of
 * choices is a fieldset with a legend, because these forms are long enough
 * that a screen reader user needs to know which question they're answering.
 */

export const fieldClass =
  "min-h-11 w-full border border-input-border bg-fir-900 px-4 py-[13px] text-[16px] text-cream placeholder:text-sub/60";

export const areaClass =
  "w-full resize-y border border-input-border bg-fir-900 px-4 py-[13px] text-[16px] leading-[1.5] text-cream placeholder:text-sub/60";

export function Fieldset({
  legend,
  hint,
  children,
  className = "",
}: {
  legend: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={`m-0 flex min-w-0 flex-col gap-4 border-0 p-0 ${className}`}>
      <legend className="display float-left w-full p-0 text-[clamp(1.5rem,2.6vw,2rem)] font-black leading-tight text-gold">
        {legend}
      </legend>
      {hint && <p className="m-0 max-w-[70ch] text-[15px] leading-[1.55] text-body">{hint}</p>}
      {children}
    </fieldset>
  );
}

/** A labelled control. Pass `required` to get the asterisk and the input flag. */
export function Labelled({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** Receives the generated id, so the label always points at the real control. */
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex min-w-0 flex-col gap-[6px]">
      <label htmlFor={id} className="text-[14px] font-bold">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-gold">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {children(id, hint ? hintId : undefined)}
      {hint && (
        <span id={hintId} className="text-[13px] leading-[1.45] text-sub">
          {hint}
        </span>
      )}
    </div>
  );
}

/** Single-line text input with its label. */
export function TextField({
  name,
  label,
  hint,
  required,
  type = "text",
  autoComplete,
  maxLength = 200,
  placeholder,
  inputMode,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric" | "url";
  defaultValue?: string;
}) {
  return (
    <Labelled label={label} hint={hint} required={required}>
      {(id, describedBy) => (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          inputMode={inputMode}
          defaultValue={defaultValue}
          aria-describedby={describedBy}
          className={fieldClass}
        />
      )}
    </Labelled>
  );
}

export function TextArea({
  name,
  label,
  hint,
  required,
  rows = 5,
  maxLength = 5_000,
  placeholder,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <Labelled label={label} hint={hint} required={required}>
      {(id, describedBy) => (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={describedBy}
          className={areaClass}
        />
      )}
    </Labelled>
  );
}

/**
 * A row of radio buttons. The whole tile is the label, so it stays a 44px tap
 * target on a phone — most of these applications will be filled in on one.
 */
export function RadioRow({
  name,
  legend,
  hint,
  options,
  defaultValue,
  required,
  onChange,
}: {
  name: string;
  legend: string;
  hint?: string;
  options: readonly string[] | readonly { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}) {
  const normalised = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-[10px] border-0 p-0">
      <legend className="p-0 text-[14px] font-bold">
        {legend}
        {required && (
          <>
            <span aria-hidden="true" className="text-gold">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      {hint && <p className="m-0 text-[13px] leading-[1.45] text-sub">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {normalised.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center gap-[10px] border border-input-border bg-fir-900 px-4 py-[10px] text-[15px] font-semibold has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-gold"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              required={required}
              defaultChecked={defaultValue === option.value}
              onChange={onChange ? () => onChange(option.value) : undefined}
              className="h-[18px] w-[18px] shrink-0 accent-gold"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A single checkbox with its description, used for the agreements. */
export function CheckboxField({
  name,
  label,
  hint,
  required,
  defaultChecked,
  onChange,
}: {
  name: string;
  label: React.ReactNode;
  hint?: string;
  required?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-[15px] leading-[1.5]">
        <input
          id={id}
          name={name}
          type="checkbox"
          required={required}
          defaultChecked={defaultChecked}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          className="mt-[3px] h-[20px] w-[20px] shrink-0 accent-gold"
        />
        <span>
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="text-gold">
                {" "}
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </span>
      </label>
      {hint && <p className="m-0 pl-8 text-[13px] leading-[1.45] text-sub">{hint}</p>}
    </div>
  );
}

/** The hidden field bots fill in and people never see. */
export function Honeypot() {
  const id = useId();
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Company</label>
      <input id={id} type="text" name="company" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

/**
 * A panel of read-only information lifted from the printed form. These sit
 * above the application in full-width sections, so the type is sized for
 * reading rather than for a sidebar.
 */
export function InfoPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 border border-line bg-fir-850 px-6 py-6 md:px-8 md:py-7 ${className}`}>
      <h3 className="display m-0 text-[24px] font-black text-gold">{title}</h3>
      <div className="flex flex-col gap-3 text-[17px] leading-[1.6] text-body">{children}</div>
    </div>
  );
}
