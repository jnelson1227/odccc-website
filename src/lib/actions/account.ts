"use server";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin, requireOwner } from "@/lib/auth";
import { failed, text, type ActionState } from "./shared";

/**
 * Passwords, not magic links.
 *
 * Magic links were the v1 sign-in, and they kept failing in a way nobody could
 * act on: the PKCE verifier lives in a cookie written when the link is
 * requested, so asking for a second link invalidates the first, and mail
 * scanners, preview panes and in-app browsers all break it. On top of that,
 * Supabase's built-in mailer is throttled and lands in spam, so a Chamber
 * volunteer could wait out the hour and never get in at all.
 *
 * A password needs no email round trip, which is the point: sign-in works even
 * while SMTP is unfinished.
 */

/**
 * Long enough to be worth having, with no composition rules — NIST's advice,
 * and the rules are what push people to "Summer2026!" on a sticky note.
 */
const MIN_LENGTH = 10;

function readNewPassword(form: FormData): { password: string } | ActionState {
  const password = form.get("password");
  const confirm = form.get("confirm");

  if (typeof password !== "string" || password.length < MIN_LENGTH) {
    return failed(`Use at least ${MIN_LENGTH} characters.`);
  }
  if (password !== confirm) {
    return failed("The two passwords don't match.");
  }
  return { password };
}

function isState(value: unknown): value is ActionState {
  return typeof value === "object" && value !== null && "status" in value;
}

/**
 * GoTrue's admin API has no "find by email", so page through. Bounded, because
 * this auth pool is shared with the Visit Reedsport app and will keep growing.
 */
async function findAuthUser(
  service: SupabaseClient,
  email: string,
): Promise<User | null | "failed"> {
  const perPage = 200;
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) return "failed";

    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < perPage) return null;
  }
  return null;
}

/**
 * The signed-in admin sets their own password.
 *
 * No current-password check: an admin who has only ever used a magic link
 * doesn't have one yet, and this is how they set their first. Anyone who could
 * reach this already holds a valid admin session, so it grants them nothing
 * they don't have — it only lets them keep it past the session's expiry, which
 * signing out everywhere would fix.
 */
export async function changeMyPassword(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readNewPassword(form);
  if (isState(parsed)) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.password });
  if (error) return failed(error.message);

  return { status: "success", message: "Password saved. Use it next time you sign in." };
}

/**
 * An owner sets another admin's password, and hands it over in person. This is
 * the account-recovery path while email is unreliable — there is no working
 * "forgot password" until custom SMTP is done.
 *
 * Guarded to the `admins` allowlist on purpose. This auth pool is shared with
 * the Visit Reedsport app, so without that check an owner could type any
 * Chamber user's address and take over their account. Adding someone to the
 * allowlist first is itself an owner-only, visible act.
 */
export async function setAdminPassword(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const me = await requireOwner();

  const email = text(form, "email")?.toLowerCase();
  if (!email) return failed("Which admin?");

  const parsed = readNewPassword(form);
  if (isState(parsed)) return parsed;

  const supabase = await createClient();

  // An owner setting their own password from this screen. Setting a password
  // through the admin API ends every session that user has, including the one
  // making the request, which signed the owner out mid-save. updateUser keeps
  // the current session.
  if (email === me.email.toLowerCase()) {
    const { error } = await supabase.auth.updateUser({ password: parsed.password });
    if (error) return failed(error.message);
    return { status: "success", message: "Password saved. Use it next time you sign in." };
  }
  const { data: admin } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (!admin) return failed(`${email} isn't on the admin list. Add them first.`);

  const service = createServiceClient();
  if (!service) return failed("The server is missing its service role key.");

  const found = await findAuthUser(service, email);
  if (found === "failed") return failed("Couldn't reach the account list. Try again.");

  // email_confirm so they can sign in straight away. The usual confirmation
  // mail is exactly the thing we can't rely on.
  const { error } = found
    ? await service.auth.admin.updateUserById(found.id, { password: parsed.password })
    : await service.auth.admin.createUser({
        email,
        password: parsed.password,
        email_confirm: true,
      });

  if (error) return failed(error.message);

  return {
    status: "success",
    message: `Password set for ${email}. Give it to them directly, not by email. It's also their Visit Reedsport password now, and they've been signed out of both.`,
  };
}
