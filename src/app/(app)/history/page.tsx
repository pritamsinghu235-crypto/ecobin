import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { FilterTabs } from "@/components/history/filter-tabs";
import { RecycleButton } from "@/components/dashboard/recycle-button";
import { getDepositHistory } from "@/lib/data";
import { PLASTIC_COLORS } from "@/lib/chart-theme";
import { PLASTIC_LABELS } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const deposits = await getDepositHistory(type);

  return (
    <>
      <Topbar title="Deposit History" action={<RecycleButton />} />
      <div className="space-y-5 p-5 lg:p-8">
        <FilterTabs />

        <Card className="animate-rise overflow-hidden">
          {deposits.length === 0 ? (
            <div className="grid place-items-center py-16 text-sm text-ink-faint">
              No deposits to show for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line/70 text-left text-xs text-ink-faint">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Machine</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 text-right font-medium">Qty</th>
                    <th className="px-5 py-3 text-right font-medium">Weight</th>
                    <th className="px-5 py-3 text-right font-medium">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-line/40 transition-colors last:border-0 hover:bg-surface/40"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-ink-muted">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="px-5 py-3">{d.machines?.name ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className="pill"
                          style={{
                            background: `${PLASTIC_COLORS[d.plastic_type]}22`,
                            color: PLASTIC_COLORS[d.plastic_type],
                          }}
                        >
                          {PLASTIC_LABELS[d.plastic_type]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">{d.quantity}</td>
                      <td className="px-5 py-3 text-right text-ink-muted">{d.weight_g}g</td>
                      <td className="px-5 py-3 text-right font-medium text-brand-bright">
                        +{d.coins_awarded}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
