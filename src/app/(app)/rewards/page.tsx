import { Coins, Gift, Ticket } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { RedeemButton } from "@/components/rewards/redeem-button";
import { getProfile, getRewards, getRedemptions } from "@/lib/data";
import { formatCompact } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default async function RewardsPage() {
  const [profile, rewards, redemptions] = await Promise.all([
    getProfile(),
    getRewards(),
    getRedemptions(8),
  ]);
  const balance = profile?.coins_balance ?? 0;

  return (
    <>
      <Topbar
        title="Rewards"
        action={
          <span className="pill bg-warn/15 text-warn">
            <Coins className="size-3.5" />
            {formatCompact(balance)} coins
          </span>
        }
      />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rewards.map((r, i) => {
            const affordable = balance >= r.cost_coins;
            const inStock = r.stock === null || r.stock > 0;
            return (
              <Card key={r.id} hover className="animate-rise flex flex-col p-5" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-brand-dim/50 text-brand-bright">
                    <Gift className="size-5" />
                  </div>
                  {r.stock !== null && (
                    <Pill tone={inStock ? "neutral" : "danger"}>
                      {inStock ? `${r.stock} left` : "Sold out"}
                    </Pill>
                  )}
                </div>
                <h3 className="mt-4 font-medium tracking-tight">{r.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted">{r.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-warn">
                  <Coins className="size-4" />
                  <span className="font-semibold">{formatCompact(r.cost_coins)}</span>
                  <span className="text-xs text-ink-faint">coins</span>
                </div>
                <div className="mt-3">
                  <RedeemButton rewardId={r.id} affordable={affordable} inStock={inStock} />
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="animate-rise">
          <div className="flex items-center gap-2 p-5 pb-2">
            <Ticket className="size-4 text-ink-muted" />
            <h3 className="text-sm font-medium text-ink-muted">Redemption History</h3>
          </div>
          {redemptions.length === 0 ? (
            <div className="grid place-items-center py-10 text-sm text-ink-faint">
              No redemptions yet — redeem your first reward above.
            </div>
          ) : (
            <ul className="divide-y divide-line/50 px-5 pb-3">
              {redemptions.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.rewards?.title ?? "Reward"}</p>
                    <p className="text-xs text-ink-faint">{formatDate(r.created_at)} · {r.status}</p>
                  </div>
                  <code className="rounded-md bg-surface px-2 py-1 font-mono text-xs text-brand-bright">
                    {r.code}
                  </code>
                  <span className="text-sm font-medium text-warn">−{r.cost_coins}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
