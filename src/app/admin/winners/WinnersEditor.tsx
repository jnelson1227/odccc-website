"use client";

import { useActionState, useState } from "react";
import SaveBar, { Toast } from "@/components/admin/SaveBar";
import { Card, Field, TableHead, cellClass, inputClass } from "@/components/admin/ui";
import { IDLE } from "@/lib/actions/state";
import { deleteWinner, saveWinner } from "@/lib/actions/content";
import { ordinal } from "@/lib/dates";
import type { Carver, Winner } from "@/lib/types";

const DIVISIONS = ["Pro", "Semi-Pro", "Quick Carve", "Other"];

export default function WinnersEditor({
  winners,
  carvers,
  currentYear,
}: {
  winners: Winner[];
  carvers: Carver[];
  currentYear: number;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const winner = winners.find((w) => w.id === editing) ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_400px]">
      <Card
        title="Results"
        hint="One row per placing. Linking a result to a carver's record makes it show on their page too."
      >
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setEditing(null);
          }}
          className="min-h-11 w-fit cursor-pointer rounded-md border-none bg-fir-900 px-4 py-[11px] text-[15px] font-bold text-cream"
        >
          + Add a result
        </button>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <TableHead columns={["Year", "Division", "Place", "Carver", ""]} />
            <tbody>
              {winners.map((w) => (
                <tr key={w.id}>
                  <td className={cellClass}>
                    <strong>{w.year}</strong>
                  </td>
                  <td className={cellClass}>{w.division}</td>
                  <td className={cellClass}>{ordinal(w.place)}</td>
                  <td className={cellClass}>
                    {w.carver_name}
                    {w.carver_id && (
                      <span className="ml-2 text-[12px] text-admin-muted">linked</span>
                    )}
                  </td>
                  <td className={cellClass}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(w.id);
                        setAdding(false);
                      }}
                      className="min-h-11 cursor-pointer border-none bg-transparent px-1 text-[14px] font-semibold underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={5} className={`${cellClass} text-admin-muted`}>
                    No results recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {(winner || adding) && (
        <WinnerForm
          key={winner?.id ?? "new"}
          winner={winner}
          carvers={carvers}
          currentYear={currentYear}
          onDone={() => {
            setEditing(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function WinnerForm({
  winner,
  carvers,
  currentYear,
  onDone,
}: {
  winner: Winner | null;
  carvers: Carver[];
  currentYear: number;
  onDone: () => void;
}) {
  const [state, action] = useActionState(saveWinner, IDLE);
  const [removeState, removeAction] = useActionState(deleteWinner, IDLE);
  const [name, setName] = useState(winner?.carver_name ?? "");

  // Picking a carver fills the name in, so the two can't drift apart.
  function onPickCarver(id: string) {
    const carver = carvers.find((c) => c.id === id);
    if (carver) setName(carver.name);
  }

  return (
    <Card title={winner ? "Edit result" : "Add result"}>
      <form action={action} className="flex flex-col gap-4">
        {winner && <input type="hidden" name="id" value={winner.id} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Year" htmlFor="winner-year">
            <input
              id="winner-year"
              name="year"
              type="number"
              min={2000}
              max={2100}
              required
              defaultValue={winner?.year ?? currentYear - 1}
              className={inputClass}
            />
          </Field>
          <Field label="Place" htmlFor="winner-place">
            <select
              id="winner-place"
              name="place"
              defaultValue={winner?.place ?? 1}
              className={inputClass}
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {ordinal(p)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Division" htmlFor="winner-division">
          <select
            id="winner-division"
            name="division"
            defaultValue={winner?.division ?? "Pro"}
            className={inputClass}
          >
            {DIVISIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field
          label="Carver record"
          htmlFor="winner-carver"
          hint="Optional — links the result to their page. Leave blank for carvers who aren't in the list."
        >
          <select
            id="winner-carver"
            name="carver_id"
            defaultValue={winner?.carver_id ?? ""}
            onChange={(e) => onPickCarver(e.target.value)}
            className={inputClass}
          >
            <option value="">— Not linked —</option>
            {carvers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Name as shown" htmlFor="winner-name">
          <input
            id="winner-name"
            name="carver_name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <SaveBar state={state} label={winner ? "Save result" : "Add result"}>
          <button
            type="button"
            onClick={onDone}
            className="min-h-11 cursor-pointer rounded-md border border-admin-border bg-white px-[14px] py-[9px] text-[14px] font-semibold"
          >
            {state.status === "success" ? "Close" : "Cancel"}
          </button>
        </SaveBar>
      </form>

      {winner && (
        <form action={removeAction} className="flex items-center gap-3 border-t border-admin-rule pt-3">
          <input type="hidden" name="id" value={winner.id} />
          <button
            type="submit"
            className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-pill-warn-text underline"
          >
            Remove this result
          </button>
          <Toast state={removeState} />
        </form>
      )}
    </Card>
  );
}
