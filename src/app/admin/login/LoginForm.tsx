"use client";

import { useId, useState } from "react";
import { createClient, createLinkClient } from "@/lib/supabase/browser";

type Mode = "password" | "link";
type State = { kind: "idle" | "working" | "sent" | "error"; message?: string };

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("password");
  const [state, setState] = useState<State>({ kind: "idle" });
  const emailId = useId();
  const passwordId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    if (typeof email !== "string" || !email.trim()) return;

    setState({ kind: "working" });
    const supabase = createClient();

    if (mode === "link") {
      const { error } = await createLinkClient().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
      });
      setState(error ? { kind: "error", message: error.message } : { kind: "sent" });
      return;
    }

    const password = form.get("password");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: typeof password === "string" ? password : "",
    });

    if (error) {
      setState({
        kind: "error",
        message:
          error.message === "Invalid login credentials"
            ? "That email and password don't match. Ask Jill to set you a new one."
            : error.message,
      });
      return;
    }

    // A full page load, not router.push(). The session cookie was written a
    // moment ago on the client; a client-side navigation can still render from
    // the router cache and bounce straight back here as "not signed in", which
    // is the exact failure this whole change exists to stop. Sign-in happens a
    // few times a year — one real page load is a fair price for certainty.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/event");
  }

  if (state.kind === "sent") {
    return (
      <p role="status" className="m-0 text-[15px] leading-[1.6]">
        <strong>Check your email.</strong> Open the newest link you get. It works on this device
        or your phone.
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

      {mode === "password" && (
        <div className="flex flex-col gap-[6px]">
          <label htmlFor={passwordId} className="text-[13px] font-semibold">
            Password
          </label>
          <input
            id={passwordId}
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="min-h-11 rounded-md border border-admin-border px-3 py-[10px] text-[15px] text-admin-text"
          />
        </div>
      )}

      {state.kind === "error" && (
        <p role="alert" className="m-0 text-[14px] font-semibold text-pill-warn-text">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.kind === "working"}
        className="min-h-11 cursor-pointer rounded-md border-none bg-gold px-5 py-3 text-[15px] font-bold text-brown disabled:opacity-70"
      >
        {state.kind === "working"
          ? mode === "link"
            ? "Sending…"
            : "Signing in…"
          : mode === "link"
            ? "Email me a sign-in link"
            : "Sign in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "link" : "password");
          setState({ kind: "idle" });
        }}
        className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-admin-muted underline"
      >
        {mode === "password"
          ? "No password yet? Email me a sign-in link"
          : "Sign in with a password instead"}
      </button>
    </form>
  );
}
