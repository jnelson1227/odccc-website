"use client";

import { useActionState } from "react";
import SaveBar from "@/components/admin/SaveBar";
import { Card, Field, Locked, inputClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { changeMyPassword } from "@/lib/actions/account";

export default function AccountForm({ email }: { email: string }) {
  const [state, action] = useActionState(changeMyPassword, IDLE);

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[480px_1fr]">
      <Card
        title="Your password"
        hint="Signing in with a password avoids the emailed link entirely."
      >
        <form action={action} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="account-email">
            <Locked value={email} tag="Signed in" />
          </Field>

          <Field
            label="New password"
            htmlFor="account-password"
            hint="At least 10 characters. A few words in a row beats a short, fiddly one."
          >
            <input
              id="account-password"
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>

          <Field label="Type it again" htmlFor="account-confirm">
            <input
              id="account-confirm"
              name="confirm"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>

          <SaveBar state={state} label="Save password" />
        </form>
      </Card>

      <Card title="If you forget it">
        <p className="m-0 text-[14px] leading-[1.6] text-admin-text">
          Ask Jill to set you a new one — she can do it from the Admins screen and tell you
          what it is. There is no self-service reset yet, because reset emails from this site
          aren&apos;t reliable enough to depend on.
        </p>
      </Card>
    </div>
  );
}
