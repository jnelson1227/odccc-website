"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import type { ActionState } from "@/lib/actions/state";

// The state type and its initial value live in @/lib/actions/state: a
// "use server" file may only export async functions, so a constant here would
// break the form at runtime.

/**
 * Best-effort per-IP rate limit. An in-memory map only holds for the lifetime
 * of one serverless instance, which is enough to stop a form being hammered
 * from a single browser; the unique index on `subscribers.email` is what
 * actually prevents duplicates. Swap for Vercel KV if this ever needs to be
 * airtight across instances.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

// Deliberately permissive: one @, a dot in the domain, no spaces. Anything
// stricter rejects real addresses.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribe(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Honeypot: a real person never fills a field they can't see.
  if (String(formData.get("company") ?? "").trim() !== "") {
    // Look successful so a bot doesn't learn to try again.
    return { status: "success", message: "You're on the list — see you in June." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim() || "/";

  if (!email) {
    return { status: "error", message: "Please enter your email address." };
  }
  if (email.length > 254 || !EMAIL.test(email)) {
    return { status: "error", message: "That doesn't look like an email address." };
  }
  if (firstName.length > 80) {
    return { status: "error", message: "That first name is too long." };
  }

  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return { status: "error", message: "Too many tries just now. Give it a minute." };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("Newsletter signup attempted without SUPABASE_SERVICE_ROLE_KEY set.");
    return {
      status: "error",
      message: "Signups aren't switched on yet. Please email the Chamber and we'll add you.",
    };
  }

  const { error } = await supabase.from("subscribers").upsert(
    {
      email,
      first_name: firstName || null,
      source,
      status: "subscribed",
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("Newsletter signup failed:", error.message);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return { status: "success", message: "You're on the list — see you in June." };
}
