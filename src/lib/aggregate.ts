import type { Deposit, PlasticType } from "@/lib/types";
import { PLASTIC_TYPES } from "@/lib/types";

export type DailyPoint = { date: string; label: string; bottles: number; coins: number };
export type BreakdownSlice = { type: PlasticType; count: number; weight: number };

/** Bottles + coins per day for the last `days` days (oldest → newest). */
export function dailyActivity(deposits: Deposit[], days = 14): DailyPoint[] {
  const buckets = new Map<string, DailyPoint>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      bottles: 0,
      coins: 0,
    });
  }

  for (const dep of deposits) {
    const key = dep.created_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.bottles += dep.quantity;
      bucket.coins += dep.coins_awarded;
    }
  }

  return [...buckets.values()];
}

/** Count + weight grouped by plastic type. */
export function plasticBreakdown(deposits: Deposit[]): BreakdownSlice[] {
  const map = new Map<PlasticType, BreakdownSlice>(
    PLASTIC_TYPES.map((t) => [t, { type: t, count: 0, weight: 0 }]),
  );
  for (const dep of deposits) {
    const slice = map.get(dep.plastic_type) ?? { type: dep.plastic_type, count: 0, weight: 0 };
    slice.count += dep.quantity;
    slice.weight += dep.weight_g;
    map.set(dep.plastic_type, slice);
  }
  return [...map.values()].filter((s) => s.count > 0);
}
