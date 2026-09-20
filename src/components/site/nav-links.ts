export type NavKey = "event" | "carvers" | "schedule" | "visit" | "sponsors";

export const NAV_LINKS: { key: NavKey; label: string; href: string }[] = [
  { key: "event", label: "The Event", href: "/the-event" },
  { key: "carvers", label: "Carvers", href: "/carvers" },
  { key: "schedule", label: "Schedule", href: "/schedule" },
  { key: "visit", label: "Visit", href: "/visit" },
  { key: "sponsors", label: "Sponsors", href: "/sponsors" },
];
