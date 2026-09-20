"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/state";

/**
 * The save row every admin form ends with. There is no draft state in v1:
 * saving publishes, and the toast says so.
 */
export default function SaveBar({
  state,
  label = "Save changes",
  children,
}: {
  state: ActionState;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SubmitButton label={label} />
      {children}
      <Toast state={state} />
    </div>
  );
}

export function SubmitButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 cursor-pointer rounded-md border-none bg-gold px-[18px] py-[11px] text-[15px] font-bold text-brown disabled:opacity-70"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

/**
 * Shows the result of the last save and then fades out, so a volunteer gets
 * confirmation without a message sitting on screen forever. Errors stay.
 */
export function Toast({ state }: { state: ActionState }) {
  const [visible, setVisible] = useState(false);
  const seen = useRef<ActionState | null>(null);

  useEffect(() => {
    if (state.status === "idle" || state === seen.current) return;
    seen.current = state;
    setVisible(true);
    if (state.status === "error") return;

    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [state]);

  if (!visible || state.status === "idle") return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`m-0 rounded-md px-3 py-2 text-[14px] font-semibold ${
        state.status === "error"
          ? "bg-pill-warn-bg text-pill-warn-text"
          : "bg-pill-ok-bg text-pill-ok-text"
      }`}
    >
      {state.message}
    </p>
  );
}
