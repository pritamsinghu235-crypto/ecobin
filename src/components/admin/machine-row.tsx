"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { setMachineStatus, deleteMachine } from "@/app/admin/actions";
import { STATUS_COLOR } from "@/lib/map-style";
import type { Machine, MachineStatus } from "@/lib/types";

const STATUSES: MachineStatus[] = ["active", "full", "offline", "maintenance"];

export function MachineRow({ machine }: { machine: Machine }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(status: MachineStatus) {
    startTransition(async () => {
      await setMachineStatus(machine.id, status);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Remove ${machine.name} (${machine.code})?`)) return;
    startTransition(async () => {
      await deleteMachine(machine.id);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-line/40 last:border-0" style={{ opacity: pending ? 0.5 : 1 }}>
      <td className="px-5 py-3 font-mono text-xs text-ink-muted">{machine.code}</td>
      <td className="px-5 py-3">
        <p className="text-sm font-medium">{machine.name}</p>
        <p className="text-xs text-ink-faint">{machine.address ?? "—"}</p>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full"
              style={{
                width: `${machine.fill_level}%`,
                background:
                  machine.fill_level >= 95
                    ? "var(--color-danger)"
                    : machine.fill_level >= 75
                      ? "var(--color-warn)"
                      : "var(--color-brand-bright)",
              }}
            />
          </div>
          <span className="font-mono text-xs text-ink-faint">{machine.fill_level}%</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: STATUS_COLOR[machine.status] }}
          />
          <select
            value={machine.status}
            onChange={(e) => changeStatus(e.target.value as MachineStatus)}
            disabled={pending}
            className="rounded-lg border border-line bg-surface/60 px-2 py-1 text-xs capitalize text-ink focus:border-brand/50 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-surface">
                {s}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="px-5 py-3 text-right">
        <button
          onClick={remove}
          disabled={pending}
          aria-label="Delete machine"
          className="text-ink-faint transition-colors hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}
