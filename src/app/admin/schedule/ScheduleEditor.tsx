"use client";

import { useActionState, useState } from "react";
import SaveBar, { Toast } from "@/components/admin/SaveBar";
import { Card, Checkbox, Field, inputClass, textareaClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { deleteScheduleItem, saveScheduleItem } from "@/lib/actions/content";
import type { DayType, ScheduleItem } from "@/lib/types";

const DAY_TYPES: { value: DayType; label: string; hint: string }[] = [
  {
    value: "weekday",
    label: "Thursday – Saturday",
    hint: "The same three days repeat, so edit this once and all three cards change.",
  },
  {
    value: "sunday",
    label: "Sunday",
    hint: "Father's Day — judging, the final auction and the awards.",
  },
];

export default function ScheduleEditor({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
      {DAY_TYPES.map((day) => (
        <Card key={day.value} title={day.label} hint={day.hint}>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {items
              .filter((item) => item.day_type === day.value)
              .map((item) => (
                <li key={item.id}>
                  <Row item={item} dayType={day.value} />
                </li>
              ))}
          </ul>
          <AddRow dayType={day.value} nextOrder={nextOrder(items, day.value)} />
        </Card>
      ))}
    </div>
  );
}

function nextOrder(items: ScheduleItem[], dayType: DayType): number {
  const inDay = items.filter((i) => i.day_type === dayType);
  return inDay.length === 0 ? 0 : Math.max(...inDay.map((i) => i.sort_order)) + 1;
}

function Row({ item, dayType }: { item: ScheduleItem; dayType: DayType }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(saveScheduleItem, IDLE);
  const [removeState, removeAction] = useActionState(deleteScheduleItem, IDLE);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full cursor-pointer flex-col items-start gap-1 rounded-md border border-admin-border p-3 text-left ${
          item.highlight ? "bg-admin-highlight" : "bg-white"
        }`}
      >
        <span className="text-[14px] font-bold">{item.time_label}</span>
        <span className="text-[14px]">{item.title}</span>
        {item.description && (
          <span className="text-[13px] text-admin-muted">{item.description}</span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-admin-border bg-admin-tint p-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="day_type" value={dayType} />
        <Fields item={item} order={item.sort_order} />
        <SaveBar state={state} label="Save row">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            Close
          </button>
        </SaveBar>
      </form>

      <form action={removeAction} className="flex items-center gap-3 border-t border-admin-rule pt-3">
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-pill-warn-text underline"
        >
          Remove this row
        </button>
        <Toast state={removeState} />
      </form>
    </div>
  );
}

function AddRow({ dayType, nextOrder }: { dayType: DayType; nextOrder: number }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(saveScheduleItem, IDLE);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 w-fit cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
      >
        + Add a row
      </button>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-md border border-admin-border bg-admin-tint p-4"
    >
      <input type="hidden" name="day_type" value={dayType} />
      <Fields item={null} order={nextOrder} />
      <SaveBar state={state} label="Add row">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
        >
          {state.status === "success" ? "Close" : "Cancel"}
        </button>
      </SaveBar>
    </form>
  );
}

function Fields({ item, order }: { item: ScheduleItem | null; order: number }) {
  const prefix = item?.id ?? "new";
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
        <Field label="Time" htmlFor={`${prefix}-time`}>
          <input
            id={`${prefix}-time`}
            name="time_label"
            type="text"
            required
            placeholder="10:30 a.m. – noon"
            defaultValue={item?.time_label ?? ""}
            className={inputClass}
          />
        </Field>
        <Field
          label="Order"
          htmlFor={`${prefix}-order`}
          hint="Lower numbers show first."
        >
          <input
            id={`${prefix}-order`}
            name="sort_order"
            type="number"
            defaultValue={item?.sort_order ?? order}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Title" htmlFor={`${prefix}-title`}>
        <input
          id={`${prefix}-title`}
          name="title"
          type="text"
          required
          defaultValue={item?.title ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Description" htmlFor={`${prefix}-description`}>
        <textarea
          id={`${prefix}-description`}
          name="description"
          rows={2}
          defaultValue={item?.description ?? ""}
          className={textareaClass}
        />
      </Field>

      <Checkbox
        id={`${prefix}-highlight`}
        name="highlight"
        defaultChecked={item?.highlight}
        label="Highlight this row"
        hint="Gold tint on the schedule card — for Quick Carve, auctions and the awards."
      />
    </>
  );
}
