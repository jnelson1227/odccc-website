"use client";

import { useActionState, useState } from "react";
import SaveBar, { Toast } from "@/components/admin/SaveBar";
import { Card, Field, TableHead, cellClass, inputClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { addAdmin, removeAdmin } from "@/lib/actions/content";
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
        hint="They sign in with a link emailed to this address — there's no password to set up."
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
          <table className="w-full min-w-[520px] border-collapse">
            <TableHead columns={["Email", "Role", "Added", ""]} />
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
