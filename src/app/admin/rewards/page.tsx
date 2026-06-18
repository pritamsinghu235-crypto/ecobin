import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { RewardRow } from "@/components/admin/reward-row";
import { RewardForm } from "@/components/admin/reward-form";
import { getAllRewards } from "@/lib/data";

export default async function AdminRewardsPage() {
  const rewards = await getAllRewards();

  return (
    <>
      <Topbar title="Rewards" />
      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
        <Card className="animate-rise lg:col-span-2 overflow-hidden">
          <div className="p-5 pb-2">
            <h3 className="text-sm font-medium text-ink-muted">Catalog · {rewards.length} rewards</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line/70 text-left text-xs text-ink-faint">
                  <th className="px-5 py-3 font-medium">Reward</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Active</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rewards.map((r) => (
                  <RewardRow key={r.id} reward={r} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="animate-rise h-fit p-5" style={{ animationDelay: "120ms" }}>
          <h3 className="text-sm font-medium text-ink-muted">Add a reward</h3>
          <p className="mt-1 mb-4 text-xs text-ink-faint">
            New rewards appear in the citizen catalog instantly.
          </p>
          <RewardForm />
        </Card>
      </div>
    </>
  );
}
