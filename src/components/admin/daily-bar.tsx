"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS, CHART_GRID } from "@/lib/chart-theme";
import type { DailyDeposit } from "@/lib/types";

export function DailyBar({ data }: { data: DailyDeposit[] }) {
  const shaped = data.map((d) => ({
    label: new Date(d.day).toLocaleDateString("en", { month: "short", day: "numeric" }),
    bottles: d.bottles,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={shaped} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          stroke={CHART_AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={20}
        />
        <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip
          cursor={{ fill: "#34d39911" }}
          contentStyle={{
            background: "#0e1626",
            border: "1px solid #1c2942",
            borderRadius: 12,
            fontSize: 12,
            color: "#f3f6fb",
          }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Bar dataKey="bottles" name="Bottles" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
