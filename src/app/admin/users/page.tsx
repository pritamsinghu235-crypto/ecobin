import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { getAdminUsers } from "@/lib/data";
import { formatCompact } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <>
      <Topbar title="Users" />
      <div className="p-5 lg:p-8">
        <Card className="animate-rise overflow-hidden">
          <div className="p-5 pb-2">
            <h3 className="text-sm font-medium text-ink-muted">{users.length} citizens</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line/70 text-left text-xs text-ink-faint">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 text-right font-medium">Bottles</th>
                  <th className="px-5 py-3 text-right font-medium">Impact</th>
                  <th className="px-5 py-3 text-right font-medium">Coins</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line/40 last:border-0 hover:bg-surface/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-xs font-semibold">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={u.role === "admin" ? "info" : "neutral"}>{u.role}</Pill>
                    </td>
                    <td className="px-5 py-3 text-right">{formatCompact(u.total_bottles)}</td>
                    <td className="px-5 py-3 text-right text-ink-muted">{formatCompact(u.impact_score)}</td>
                    <td className="px-5 py-3 text-right text-warn">{formatCompact(u.coins_balance)}</td>
                    <td className="px-5 py-3 text-ink-muted">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
