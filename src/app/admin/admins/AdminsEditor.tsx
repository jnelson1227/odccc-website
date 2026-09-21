"use client";

import { useActionState, useState } from "react";
import SaveBar, { SubmitButton, Toast } from "@/components/admin/SaveBar";
import { Card, Field, TableHead, cellClass, inputClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { addAdmin, removeAdmin } from "@/lib/actions/content";
import { setAdminPassword } from "@/lib/actions/account";
import type { Admin } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function AdminsEditor({
  admins,
  currentEmail,
}: {
  admins: Admin[];
  currentEmail: string;
}) {
  const [state, action] = useActionState(addAdmin, IDLE);

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[400px_1fr]">
      <Card
        title="Add an admin"
        hint="Add them here first, then set them a password below and tell them what it is."
      >
        <form action={action} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="admin-email">
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              placeholder="volunteer@example.com"
              className={inputClass}
            />
          </Field>
          <Field
            label="Role"
            htmlFor="admin-role"
            hint="Editors change content. Owners can also add and remove admins."
          >
            <select id="admin-role" name="role" defaultValue="editor" className={inputClass}>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
          </Field>
          <SaveBar state={state} label="Add admin" />
        </form>
      </Card>

      <Card title={`Admins (${admins.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <TableHead columns={["Email", "Role", "Added", "Password", ""]} />
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.email}>
                  <td className={cellClass}>
                    <strong>{admin.email}</strong>
                    {admin.email.toLowerCase() === currentEmail.toLowerCase() && (
                      <span className="ml-2 text-[12px] text-admin-muted">that&apos;s you</span>
                    )}
                  </td>
                  <td className={cellClass}>{admin.role}</td>
                  <td className={cellClass}>{DATE.format(new Date(admin.created_at))}</td>
                  <td className={cellClass}>
                    <SetPassword email={admin.email} />
                  </td>
                  <td className={cellClass}>
                    {admin.email.toLowerCase() !== currentEmail.toLowerCase() && (
                      <RemoveAdmin email={admin.email} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RemoveAdmin({ email }: { email: string }) {
  const [state, action] = useActionState(removeAdmin, IDLE);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold text-pill-warn-text underline"
      >
        Remove
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-bold text-pill-warn-text underline"
      >
        Really remove
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold underline"
      >
        Keep
      </button>
      <Toast state={state} />
    </form>
  );
}

/**
 * An owner sets a volunteer's password and reads it out to them. Deliberately
 * not emailed: mail from this site is the unreliable part, and it's what the
 * password is here to route around.
 */
function SetPassword({ email }: { email: string }) {
  const [state, action] = useActionState(setAdminPassword, IDLE);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold underline"
      >
        Set password
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 py-2">
      <input type="hidden" name="email" value={email} />
      <input
        name="password"
        type="password"
        required
        minLength={10}
        placeholder="New password"
        aria-label={`New password for ${email}`}
        autoComplete="new-password"
        className={`${inputClass} min-w-[200px]`}
      />
      <input
        name="confirm"
        type="password"
        required
        minLength={10}
        placeholder="Type it again"
        aria-label={`Confirm new password for ${email}`}
        autoComplete="new-password"
        className={`${inputClass} min-w-[200px]`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton label="Set it" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[13px] font-semibold underline"
        >
          Cancel
        </button>
      </div>
      <Toast state={state} />
    </form>
  );
}
