/**
 * The shape every admin form reports back in.
 *
 * Kept apart from ./shared so client components can import it: ./shared is
 * server-only (it touches the Next.js cache), and importing it from a "use
 * client" file fails the build.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const IDLE: ActionState = { status: "idle", message: "" };

/** There is no draft state in v1 — saving is publishing. */
export const SAVED: ActionState = { status: "success", message: "Saved — live on the site" };

export function failed(message: string): ActionState {
  return { status: "error", message };
}
