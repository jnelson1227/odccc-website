import type { Subscriber } from "@/lib/types";

/**
 * How many people have signed up in the last N days.
 *
 * This lives outside the component because it reads the clock, and reading the
 * clock during render isn't pure — the same render could produce two different
 * numbers. Call it from a server component and pass the result down.
 */
export function countRecentSignups(subscribers: Subscriber[], days = 30): number {
  const cutoff = Date.now() - days * 86_400_000;
  return subscribers.filter(
    (s) => s.status === "subscribed" && new Date(s.created_at).getTime() > cutoff,
  ).length;
}
