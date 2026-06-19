import { Recycle, Scale, Users, Cpu, Boxes, Gauge } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DailyBar } from "@/components/admin/daily-bar";
import { PlasticDonut } from "@/components/dashboard/plastic-donut";
import {
  getAdminStats,
  getAdminDaily,
  getAdminTopMachines,
  getAdminPlasticSplit,
} from "@/lib/data";
import { formatCompact } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const [stats, daily, top, split] = await Promise.all([
    getAdminStats(),
    getAdminDaily(14),
    getAdminTopMachines(6),
    getAdminPlasticSplit(),
  ]);

  const cards = [
    { label: "Total Deposits", value: stats?.total_deposits ?? 0, format: "compact" as const, icon: Boxes, accent: "brand" as const },
    { label: "Bottles Collected", value: stats?.total_bottles ?? 0, format: "compact" as const, icon: Recycle, accent: "accent" as const },
    { label: "Weight Collected", value: (stats?.total_weight_g ?? 0) / 1000, format: "fixed1" as const, unit: "kg", icon: Scale, accent: "info" as const },
    { label: "Citizens", value: stats?.total_users ?? 0, format: "compact" as const, icon: Users, accent: "warn" as const },
    { label: "Machines", value: `${stats?.active_machines ?? 0}/${stats?.total_machines ?? 0}`, icon: Cpu, accent: "brand" as const },
    { label: "Avg Fill Level", value: Number(stats?.avg_fill ?? 0), unit: "%", icon: Gauge, accent: "accent" as const },
  ];

  const donutData = split.map((s) => ({ type: s.plastic_type, count: s.count, weight: 0 }));

  return (
    <>
      <Topbar title="City Overview" />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((c, i) => (
            <StatCard key={c.label} {...c} delay={i * 60} />
          ))}
        </div>

        <Card className="animate-rise" style={{ animationDelay: "360ms" }}>
          <div className="flex h-72 flex-col p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink-muted">Collection Volume</h3>
              <span className="text-xs text-ink-faint">Bottles · last 14 days</span>
            </div>
            <div className="mt-4 flex-1">
              <DailyBar data={daily} />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="animate-rise" style={{ animationDelay: "440ms" }}>
            <div className="flex h-72 flex-col p-5">
              <h3 className="text-sm font-medium text-ink-muted">Plastic Mix</h3>
              <div className="mt-2 flex-1">
                {donutData.length > 0 ? (
                  <PlasticDonut data={donutData} />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-ink-faint">No data yet</div>
                )}
              </div>
            </div>
          </Card>

          <Card className="animate-rise lg:col-span-2" style={{ animationDelay: "520ms" }}>
            <div className="p-5 pb-2">
              <h3 className="text-sm font-medium text-ink-muted">Most Active Locations</h3>
            </div>
            <ul className="divide-y divide-line/50 px-5 pb-3">
              {top.map((m, i) => (
                <li key={m.code} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-center font-mono text-sm text-ink-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-ink-faint">{m.code}</p>
                  </div>
                  <span className="text-sm text-ink-muted">{(m.weight / 1000).toFixed(1)} kg</span>
                  <span className="w-16 text-right text-sm font-medium text-brand-bright">
                    {formatCompact(m.deposits)} drops
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
