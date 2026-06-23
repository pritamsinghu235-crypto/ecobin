import {
  Award,
  Gem,
  Globe,
  Leaf,
  Lock,
  Medal,
  Recycle,
  Sparkles,
  Sprout,
  Star,
  Trophy,
} from "lucide-react";
import type { BadgeProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Award> = {
  Sprout,
  Recycle,
  Medal,
  Trophy,
  Leaf,
  Globe,
  Award,
  Sparkles,
  Star,
  Gem,
};

export function Achievements({ badges }: { badges: BadgeProgress[] }) {
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-muted">Achievements</h3>
        <span className="text-xs text-ink-faint">
          {earnedCount}/{badges.length}
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-3">
        {badges.map((b) => {
          const Icon = ICONS[b.icon] ?? Award;
          return (
            <li
              key={b.id}
              title={`${b.name} — ${b.description}`}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                b.earned
                  ? "border-brand/30 bg-brand-dim/30"
                  : "border-line/60 bg-surface/30",
              )}
            >
              <div
                className={cn(
                  "relative grid size-10 place-items-center rounded-full",
                  b.earned ? "bg-brand-dim/60 text-brand-bright" : "bg-surface text-ink-faint",
                )}
              >
                <Icon className="size-5" />
                {!b.earned && (
                  <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-canvas text-ink-faint">
                    <Lock className="size-2.5" />
                  </span>
                )}
              </div>
              <span className={cn("text-[11px] font-medium leading-tight", !b.earned && "text-ink-muted")}>
                {b.name}
              </span>
              {!b.earned && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-ink-faint/60"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
