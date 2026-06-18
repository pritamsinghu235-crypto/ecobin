import { Recycle } from "lucide-react";
import type { Deposit } from "@/lib/types";
import { PLASTIC_COLORS } from "@/lib/chart-theme";
import { PLASTIC_LABELS } from "@/lib/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentDeposits({ deposits }: { deposits: Deposit[] }) {
  if (deposits.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-surface text-ink-faint">
          <Recycle className="size-5" />
        </div>
        <p className="text-sm font-medium">No deposits yet</p>
        <p className="max-w-[14rem] text-xs text-ink-faint">
          Hit “Recycle a bottle” to log your first deposit and watch the numbers move.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line/60">
      {deposits.map((d) => (
        <li key={d.id} className="flex items-center gap-3 py-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold"
            style={{ background: `${PLASTIC_COLORS[d.plastic_type]}22`, color: PLASTIC_COLORS[d.plastic_type] }}
          >
            {PLASTIC_LABELS[d.plastic_type]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {d.machines?.name ?? "Smart machine"}
            </p>
            <p className="text-xs text-ink-faint">
              {d.quantity} bottle · {d.weight_g}g · {timeAgo(d.created_at)}
            </p>
          </div>
          <span className="ml-auto text-sm font-medium text-brand-bright">+{d.coins_awarded}</span>
        </li>
      ))}
    </ul>
  );
}
