import { Fragment, type ReactNode, createElement } from "react";

/**
 * The admin lets volunteers mark a lead-in bold with **double stars** — the
 * only formatting the hero paragraphs support. Anything else is shown as
 * typed, so a stray asterisk can't break the page.
 */
export function renderBold(text: string | null | undefined, boldClassName: string): ReactNode {
  if (!text) return null;

  const parts = text.split(/\*\*(.+?)\*\*/gs);
  return parts.map((part, i) =>
    // Odd indices are the captured groups, i.e. the text inside the stars.
    i % 2 === 1
      ? createElement("strong", { key: i, className: boldClassName }, part)
      : createElement(Fragment, { key: i }, part),
  );
}

/** The same text with the markup stripped — for meta descriptions and alt text. */
export function stripBold(text: string | null | undefined): string {
  return (text ?? "").replace(/\*\*(.+?)\*\*/gs, "$1");
}
