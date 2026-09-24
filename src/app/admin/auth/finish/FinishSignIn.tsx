"use client";

import { useEffect, useRef, useState } from "react";
import { createLinkClient } from "@/lib/supabase/browser";

/**
 * Finishes an emailed sign-in link. The session is in the URL fragment
 * (#access_token=…&refresh_token=…), readable only here in the browser.
 * setSession writes it to the auth cookies the server reads.
 */
export default function FinishSignIn() {
  const [failed, setFailed] = useState(false);
  // Once only. The first run clears the fragment, so a second run (React's
  // dev double-invoke) would see no tokens and report a bad link.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    // Keep tokens out of the address bar and history either way.
    window.history.replaceState(null, "", window.location.pathname);

    if (!access_token || !refresh_token) {
      const reason = (params.get("error_code") ?? "").includes("expired") ? "expired" : "rejected";
      window.location.replace(`/admin/login?error=${reason}`);
      return;
    }

    createLinkClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setFailed(true);
          return;
        }
        // A full page load, for the same reason as LoginForm: the server must
        // see the new cookie, not a cached "signed out" render.
        window.location.replace("/admin/event");
      });
  }, []);

  if (failed) {
    return (
      <p role="alert" className="m-0 text-[15px] leading-[1.6]">
        <strong>That sign-in link didn&apos;t work.</strong>{" "}
        <a href="/admin/login" className="font-semibold underline">
          Ask for a new one
        </a>
        .
      </p>
    );
  }

  return (
    <p role="status" className="m-0 text-[15px]">
      Signing you in…
    </p>
  );
}
