"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownSlice } from "@/lib/aggregate";
import { PLASTIC_COLORS } from "@/lib/chart-theme";
import { PLASTIC_LABELS } from "@/lib/types";

export function PlasticDonut({ data }: { data: BreakdownSlice[] }) {
  const total = data.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((s) => (
                <Cell key={s.type} fill={PLASTIC_COLORS[s.type]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0e1626",
                border: "1px solid #1c2942",
                borderRadius: 12,
                fontSize: 12,
                color: "#f3f6fb",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs text-ink-faint">bottles</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2">
        {data.map((s) => (
          <li key={s.type} className="flex items-center gap-2.5 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: PLASTIC_COLORS[s.type] }} />
            <span className="text-ink-muted">{PLASTIC_LABELS[s.type]}</span>
            <span className="ml-auto font-medium">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
