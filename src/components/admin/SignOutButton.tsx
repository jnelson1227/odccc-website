"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        // "local", not the default "global": the auth pool is shared with the
        // Visit Reedsport app, and a global sign-out here would end the same
        // person's sessions there, and on every other device, too.
        await createClient().auth.signOut({ scope: "local" });
        router.replace("/admin/login");
        router.refresh();
      }}
      className="min-h-11 cursor-pointer rounded-md border border-cream/25 bg-transparent px-3 py-2 text-left text-[13px] font-semibold text-cream disabled:opacity-60"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
