import { type LucideIcon, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedNumber, type NumberFormat } from "@/components/animations/animated-number";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  accent = "brand",
  delay = 0,
  format,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  icon: LucideIcon;
  accent?: "brand" | "accent" | "info" | "warn";
  delay?: number;
  format?: NumberFormat;
}) {
  const accents = {
    brand: "text-brand-bright bg-brand-dim/50",
    accent: "text-accent bg-accent-dim/50",
    info: "text-info bg-info/10",
    warn: "text-warn bg-warn/10",
  } as const;

  return (
    <Card hover className="animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between p-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">
            {typeof value === "number" ? <AnimatedNumber value={value} format={format} /> : value}
            {unit && <span className="ml-1 text-base font-normal text-ink-muted">{unit}</span>}
          </p>
          {delta && (
            <div className="flex items-center gap-1.5 text-xs text-brand-bright">
              <TrendingUp className="size-3.5" />
              <span>{delta}</span>
              <span className="text-ink-faint">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("grid size-11 place-items-center rounded-xl", accents[accent])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
