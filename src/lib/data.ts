import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminStats,
  AdminUser,
  AppNotification,
  Badge,
  BadgeProgress,
  DailyDeposit,
  Deposit,
  LeaderboardRow,
  Machine,
  MapMachine,
  MyRank,
  PlasticSplit,
  Profile,
  Redemption,
  Reward,
  TopMachine,
} from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

/** Recent deposits with the machine name joined, for the history feed. */
export async function getRecentDeposits(limit = 8): Promise<Deposit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deposits")
    .select("id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points, created_at, machines(name, code)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Deposit[]) ?? [];
}

/** A wider slice used to build the charts (aggregated client-side). */
export async function getDepositsForCharts(limit = 400): Promise<Deposit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deposits")
    .select("id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Deposit[]) ?? [];
}

/** Full deposit history, optionally filtered by plastic type. */
export async function getDepositHistory(plasticType?: string, limit = 100): Promise<Deposit[]> {
  const supabase = await createClient();
  let query = supabase
    .from("deposits")
    .select("id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points, created_at, machines(name, code)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (plasticType && plasticType !== "ALL") {
    query = query.eq("plastic_type", plasticType);
  }

  const { data } = await query;
  return (data as unknown as Deposit[]) ?? [];
}

/** Active machines the deposit picker can target. */
export async function getActiveMachines(): Promise<Machine[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("machines")
    .select("*")
    .neq("status", "offline")
    .order("code");
  return (data as Machine[]) ?? [];
}

export type MachineLive = Pick<
  Machine,
  "id" | "code" | "name" | "status" | "fill_level"
> & { last_seen_at: string | null };

/** Lightweight machine roster for the live network panel. */
export async function getMachinesLive(): Promise<MachineLive[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("machines")
    .select("id, code, name, status, fill_level, last_seen_at")
    .order("code");
  return (data as MachineLive[]) ?? [];
}

/** Full machine roster (with coordinates) for the interactive map. */
export async function getMachinesForMap(): Promise<MapMachine[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("machines")
    .select("id, code, name, address, lat, lng, status, fill_level, accepted_materials, last_seen_at")
    .order("code");
  return (data as MapMachine[]) ?? [];
}

// ---- Phase 6: gamification ----------------------------------

export async function getRewards(): Promise<Reward[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("cost_coins");
  return (data as Reward[]) ?? [];
}

export async function getRedemptions(limit = 10): Promise<Redemption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reward_redemptions")
    .select("id, reward_id, cost_coins, status, code, created_at, rewards(title)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Redemption[]) ?? [];
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("leaderboard_ranked", { p_limit: limit });
  return (data as LeaderboardRow[]) ?? [];
}

export async function getMyRank(): Promise<MyRank | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_rank");
  const rows = (data as MyRank[]) ?? [];
  return rows[0] ?? null;
}

/** Badge catalog merged with the caller's earned set + progress. */
export async function getBadgeProgress(): Promise<BadgeProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: badges }, { data: earned }, { data: profile }] = await Promise.all([
    supabase.from("badges").select("*").order("sort"),
    supabase.from("user_badges").select("badge_id"),
    supabase.from("profiles").select("total_bottles, impact_score").eq("id", user.id).single(),
  ]);

  const earnedIds = new Set((earned ?? []).map((r: { badge_id: string }) => r.badge_id));
  const stats = (profile as { total_bottles: number; impact_score: number } | null) ?? {
    total_bottles: 0,
    impact_score: 0,
  };

  return ((badges as Badge[]) ?? []).map((b) => {
    const current = b.metric === "total_bottles" ? stats.total_bottles : stats.impact_score;
    return {
      ...b,
      earned: earnedIds.has(b.id),
      current,
      pct: Math.min(100, Math.round((current / b.threshold) * 100)),
    };
  });
}

export async function getNotifications(limit = 30): Promise<AppNotification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AppNotification[]) ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  return count ?? 0;
}

// ---- Phase 7: admin -----------------------------------------

/** True when the signed-in user has the admin role. */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return (data as { role: string } | null)?.role === "admin";
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_stats");
  return ((data as AdminStats[]) ?? [])[0] ?? null;
}

export async function getAdminDaily(days = 14): Promise<DailyDeposit[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_daily_deposits", { p_days: days });
  return (data as DailyDeposit[]) ?? [];
}

export async function getAdminTopMachines(limit = 8): Promise<TopMachine[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_top_machines", { p_limit: limit });
  return (data as TopMachine[]) ?? [];
}

export async function getAdminPlasticSplit(): Promise<PlasticSplit[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_plastic_split");
  return (data as PlasticSplit[]) ?? [];
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, total_bottles, coins_balance, impact_score, created_at")
    .order("total_bottles", { ascending: false });
  return (data as AdminUser[]) ?? [];
}

export async function getAllMachines(): Promise<Machine[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("machines").select("*").order("code");
  return (data as Machine[]) ?? [];
}

/** Look up a single machine by its human-readable code (e.g. from a QR scan). */
export async function getMachineByCode(code: string): Promise<Machine | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("machines").select("*").eq("code", code).maybeSingle();
  return (data as Machine | null) ?? null;
}

export async function getAllRewards(): Promise<Reward[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("rewards").select("*").order("cost_coins");
  return (data as Reward[]) ?? [];
}
