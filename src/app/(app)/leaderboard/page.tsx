import { Crown, Recycle, Leaf } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { getLeaderboard, getMyRank } from "@/lib/data";
import { formatCompact, cn } from "@/lib/utils";

const PODIUM = [
  { ring: "ring-warn/60", bg: "from-warn/20", order: "order-2 sm:-mt-4" }, // 1st (center, tallest)
  { ring: "ring-ink-faint/50", bg: "from-ink-faint/15", order: "order-1" }, // 2nd
  { ring: "ring-[#cd7f32]/50", bg: "from-[#cd7f32]/15", order: "order-3" }, // 3rd
];

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default async function LeaderboardPage() {
  const [rows, mine] = await Promise.all([getLeaderboard(20), getMyRank()]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const meInList = rows.some((r) => r.is_me);

  return (
    <>
      <Topbar title="Leaderboard" />
      <div className="space-y-6 p-5 lg:p-8">
        {/* Podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {top3.map((r, i) => (
              <Card
                key={r.rank}
                className={cn(
                  "animate-rise flex flex-col items-center bg-gradient-to-b to-transparent p-5 text-center",
                  PODIUM[i].bg,
                  PODIUM[i].order,
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "grid size-14 place-items-center rounded-full bg-elevated text-sm font-semibold ring-2",
                      PODIUM[i].ring,
                      r.is_me && "outline outline-2 outline-brand",
                    )}
                  >
                    {initials(r.full_name)}
                  </div>
                  {i === 0 && (
                    <Crown className="absolute -top-3 left-1/2 size-5 -translate-x-1/2 text-warn" />
                  )}
                </div>
                <p className="mt-3 truncate text-sm font-medium">
                  {r.is_me ? "You" : r.full_name}
                </p>
                <p className="text-xs text-ink-faint">#{r.rank}</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-brand-bright">
                  {formatCompact(r.total_bottles)}
                </p>
                <p className="text-xs text-ink-faint">bottles</p>
              </Card>
            ))}
          </div>
        )}

        {/* Ranks 4+ */}
        <Card className="animate-rise overflow-hidden" style={{ animationDelay: "240ms" }}>
          {rows.length === 0 ? (
            <div className="grid place-items-center py-16 text-sm text-ink-faint">
              No recyclers yet — be the first on the board.
            </div>
          ) : (
            <ul className="divide-y divide-line/50">
              {rest.map((r) => (
                <Row key={r.rank} r={r} />
              ))}
              {!meInList && mine && (
                <li className="bg-brand-dim/20">
                  <RowInner
                    rank={mine.rank}
                    isMe
                    name="You"
                    bottles={mine.total_bottles}
                    impact={mine.impact_score}
                  />
                </li>
              )}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Row({ r }: { r: Awaited<ReturnType<typeof getLeaderboard>>[number] }) {
  return (
    <li className={cn(r.is_me && "bg-brand-dim/20")}>
      <RowInner
        rank={r.rank}
        isMe={r.is_me}
        name={r.is_me ? "You" : r.full_name}
        bottles={r.total_bottles}
        impact={r.impact_score}
      />
    </li>
  );
}

function RowInner({
  rank,
  isMe,
  name,
  bottles,
  impact,
}: {
  rank: number;
  isMe: boolean;
  name: string;
  bottles: number;
  impact: number;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <span className="w-6 text-center font-mono text-sm text-ink-muted">{rank}</span>
      <div
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full bg-elevated text-xs font-semibold",
          isMe && "bg-brand text-[#04130d]",
        )}
      >
        {initials(name)}
      </div>
      <span className={cn("flex-1 truncate text-sm", isMe ? "font-semibold" : "font-medium")}>
        {name}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Recycle className="size-3.5 text-brand-bright" />
        {formatCompact(bottles)}
      </span>
      <span className="hidden items-center gap-1.5 text-sm text-ink-muted sm:flex">
        <Leaf className="size-3.5 text-info" />
        {formatCompact(impact)}
      </span>
    </div>
  );
}
