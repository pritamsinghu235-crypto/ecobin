import { Recycle, Scale, Coins, Leaf } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { PlasticDonut } from "@/components/dashboard/plastic-donut";
import { RecentDeposits } from "@/components/dashboard/recent-deposits";
import { RecycleButton } from "@/components/dashboard/recycle-button";
import { NetworkPanel } from "@/components/dashboard/network-panel";
import { Achievements } from "@/components/dashboard/achievements";
import {
  getProfile,
  getRecentDeposits,
  getDepositsForCharts,
  getMachinesLive,
  getBadgeProgress,
} from "@/lib/data";
import { dailyActivity, plasticBreakdown } from "@/lib/aggregate";
import { formatCompact } from "@/lib/utils";

export default async function DashboardPage() {
  const [profile, recent, chartDeposits, machines, badges] = await Promise.all([
    getProfile(),
    getRecentDeposits(6),
    getDepositsForCharts(),
    getMachinesLive(),
    getBadgeProgress(),
  ]);

  const bottles = profile?.total_bottles ?? 0;
  const weightKg = (profile?.total_weight_g ?? 0) / 1000;
  const coins = profile?.coins_balance ?? 0;
  const impact = profile?.impact_score ?? 0;
  // Rough lifecycle estimate: recycling 1g of plastic avoids ~3g CO₂e.
  const co2Kg = ((profile?.total_weight_g ?? 0) * 3) / 1000;

  const activity = dailyActivity(chartDeposits, 14);
  const breakdown = plasticBreakdown(chartDeposits);

  const stats = [
    { label: "Bottles Recycled", value: formatCompact(bottles), icon: Recycle, accent: "brand" as const },
    { label: "Weight Collected", value: weightKg.toFixed(1), unit: "kg", icon: Scale, accent: "accent" as const },
    { label: "Coins Earned", value: formatCompact(coins), icon: Coins, accent: "warn" as const },
    { label: "Impact Score", value: formatCompact(impact), icon: Leaf, accent: "info" as const },
  ];

  return (
    <>
      <Topbar title="Dashboard" action={<RecycleButton />} />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 80} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="animate-rise lg:col-span-2" style={{ animationDelay: "320ms" }}>
            <div className="flex h-80 flex-col p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-ink-muted">Recycling Activity</h3>
                <span className="text-xs text-ink-faint">Last 14 days</span>
              </div>
              <div className="mt-4 flex-1">
                <ActivityChart data={activity} />
              </div>
            </div>
          </Card>

          <Card className="animate-rise" style={{ animationDelay: "400ms" }}>
            <div className="flex h-80 flex-col p-5">
              <h3 className="text-sm font-medium text-ink-muted">Plastic Breakdown</h3>
              <div className="mt-2 flex-1">
                {breakdown.length > 0 ? (
                  <PlasticDonut data={breakdown} />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-ink-faint">
                    No deposits yet
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="animate-rise h-96 lg:col-span-2" style={{ animationDelay: "480ms" }}>
            <NetworkPanel initial={machines} />
          </Card>

          <Card className="animate-rise" style={{ animationDelay: "560ms" }}>
            <Achievements badges={badges} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="animate-rise lg:col-span-2" style={{ animationDelay: "640ms" }}>
            <div className="flex items-center justify-between p-5 pb-2">
              <h3 className="text-sm font-medium text-ink-muted">Recent Deposits</h3>
            </div>
            <div className="px-5 pb-3">
              <RecentDeposits deposits={recent} />
            </div>
          </Card>

          <Card className="animate-rise" style={{ animationDelay: "720ms" }}>
            <div className="flex h-full flex-col justify-between p-5">
              <h3 className="text-sm font-medium text-ink-muted">Environmental Impact</h3>
              <div className="py-4">
                <p className="text-4xl font-semibold tracking-tight text-gradient">
                  {co2Kg.toFixed(1)}
                  <span className="ml-1 text-lg text-ink-muted">kg</span>
                </p>
                <p className="mt-1 text-sm text-ink-muted">CO₂ emissions avoided</p>
              </div>
              <p className="text-xs leading-relaxed text-ink-faint">
                Estimated from {weightKg.toFixed(1)} kg of plastic kept out of landfill.
                Every bottle counts toward a cleaner city.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
