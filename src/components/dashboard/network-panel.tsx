"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type MachineLive = {
  id: string;
  code: string;
  name: string;
  status: "active" | "full" | "offline" | "maintenance";
  fill_level: number;
  last_seen_at: string | null;
};

const statusTone: Record<MachineLive["status"], string> = {
  active: "bg-brand-bright",
  full: "bg-warn",
  offline: "bg-ink-faint",
  maintenance: "bg-info",
};

function fillColor(fill: number) {
  if (fill >= 95) return "var(--color-danger)";
  if (fill >= 75) return "var(--color-warn)";
  return "var(--color-brand-bright)";
}

export function NetworkPanel({ initial }: { initial: MachineLive[] }) {
  const [machines, setMachines] = useState<MachineLive[]>(initial);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/machines", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (active && json.machines) {
          setMachines(json.machines);
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
        }
      } catch {
        // transient — keep last good state
      }
    };
    const id = setInterval(tick, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-muted">Smart Bin Network</h3>
        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Radio className={cn("size-3.5 text-brand-bright", pulse && "animate-pulse-ring rounded-full")} />
          live · {machines.length} machines
        </span>
      </div>

      <ul className="mt-4 space-y-3 overflow-y-auto pr-1">
        {machines.map((m) => (
          <li key={m.id} className="flex items-center gap-3">
            <span className={cn("size-2 shrink-0 rounded-full", statusTone[m.status])} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{m.name}</span>
                <span className="shrink-0 font-mono text-xs text-ink-faint">{m.fill_level}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${m.fill_level}%`, background: fillColor(m.fill_level) }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
