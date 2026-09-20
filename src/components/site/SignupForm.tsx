"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { subscribe } from "@/app/actions/subscribe";
import { IDLE } from "@/lib/actions/state";

export default function SignupForm({ source }: { source: string }) {
  const [state, formAction] = useActionState(subscribe, IDLE);
  const nameId = useId();
  const emailId = useId();
  const statusId = useId();

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="display m-0 text-[clamp(1.5rem,3vw,2rem)] font-black leading-tight text-gold"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="source" value={source} />

      {/* Honeypot. Hidden from sight and from screen readers, but bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${nameId}-co`}>Company</label>
        <input id={`${nameId}-co`} type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr]">
        <Field id={nameId} label="First name">
          <input
            id={nameId}
            name="first_name"
            type="text"
            autoComplete="given-name"
            maxLength={80}
            className="min-h-11 border border-input-border bg-fir-900 px-4 py-[14px] text-[16px] text-cream"
          />
        </Field>
        <Field id={emailId} label="Email">
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            aria-describedby={state.status === "error" ? statusId : undefined}
            aria-invalid={state.status === "error" || undefined}
            className="min-h-11 border border-input-border bg-fir-900 px-4 py-[14px] text-[16px] text-cream placeholder:text-sub/70"
          />
        </Field>
      </div>

      {state.status === "error" && (
        <p id={statusId} role="alert" className="m-0 text-[14px] font-bold text-gold">
          {state.message}
        </p>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <span className="text-[13px] text-sub">No spam. Unsubscribe anytime.</span>
        <SubmitButton />
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[13px] font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full cursor-pointer border-none bg-gold px-7 py-4 text-[17px] font-bold text-brown disabled:opacity-70 sm:w-auto"
    >
      {pending ? "Signing you up…" : "Sign me up"}
    </button>
  );
}
