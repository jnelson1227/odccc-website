"use client";

import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type State = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

export default function LoginForm() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const emailId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email !== "string" || !email.trim()) return;

    setState({ kind: "sending" });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
        // Admins are added by an owner under Admins, never by signing in.
        shouldCreateUser: true,
      },
    });

    if (error) {
      setState({ kind: "error", message: error.message });
      return;
    }
    setState({ kind: "sent" });
  }

  if (state.kind === "sent") {
    return (
      <p role="status" className="m-0 text-[15px] leading-[1.6]">
        <strong>Check your email.</strong> The link signs you straight in. It works once and
        expires after an hour — if it&apos;s gone stale, just ask for another.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-[6px]">
        <label htmlFor={emailId} className="text-[13px] font-semibold">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          className="min-h-11 rounded-md border border-admin-border px-3 py-[10px] text-[15px] text-admin-text"
        />
      </div>

      {state.kind === "error" && (
        <p role="alert" className="m-0 text-[14px] font-semibold text-pill-warn-text">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.kind === "sending"}
        className="min-h-11 cursor-pointer rounded-md border-none bg-gold px-5 py-3 text-[15px] font-bold text-brown disabled:opacity-70"
      >
        {state.kind === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
