"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "@/lib/aggregate";
import { CHART_AXIS, CHART_GRID } from "@/lib/chart-theme";

export function ActivityChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="fillBottles" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          stroke={CHART_AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip
          cursor={{ stroke: "#34d399", strokeOpacity: 0.3 }}
          contentStyle={{
            background: "#0e1626",
            border: "1px solid #1c2942",
            borderRadius: 12,
            fontSize: 12,
            color: "#f3f6fb",
          }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Area
          type="monotone"
          dataKey="bottles"
          name="Bottles"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#fillBottles)"
          dot={false}
          activeDot={{ r: 4, fill: "#34d399" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
