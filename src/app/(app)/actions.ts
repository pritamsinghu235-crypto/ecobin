"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLASTIC_TYPES, type PlasticType } from "@/lib/types";

export type DepositResult =
  | { ok: true; plastic: PlasticType; coins: number; weight: number }
  | { ok: false; error: string };

/**
 * Demo deposit — stands in for the IoT machine until the Phase 4 simulator.
 * Picks an active machine, "AI-classifies" a random plastic type + weight,
 * then defers to the server-authoritative `record_deposit` RPC for rewards.
 */
export async function recycleBottle(): Promise<DepositResult> {
  const supabase = await createClient();

  const { data: machines } = await supabase
    .from("machines")
    .select("id")
    .eq("status", "active")
    .limit(20);

  if (!machines || machines.length === 0) {
    return { ok: false, error: "No active machines available right now." };
  }

  const machine = machines[Math.floor(Math.random() * machines.length)];
  const plastic = PLASTIC_TYPES[Math.floor(Math.random() * PLASTIC_TYPES.length)];
  const weight = 15 + Math.floor(Math.random() * 30); // 15–44g, a typical bottle

  const { data, error } = await supabase.rpc("record_deposit", {
    p_machine_id: machine.id,
    p_plastic_type: plastic,
    p_quantity: 1,
    p_weight_g: weight,
  });

  if (error) return { ok: false, error: error.message };

  // Award any milestone badges unlocked by this deposit (server-side).
  await supabase.rpc("award_badges");

  revalidatePath("/dashboard");
  revalidatePath("/history");

  return {
    ok: true,
    plastic,
    coins: (data as { coins_awarded: number }).coins_awarded,
    weight,
  };
}

export type RedeemResult = { ok: true; code: string } | { ok: false; error: string };

export async function redeemReward(rewardId: string): Promise<RedeemResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId });

  if (error) {
    const friendly = error.message.includes("insufficient")
      ? "Not enough coins for this reward."
      : error.message.includes("out of stock")
        ? "This reward is out of stock."
        : error.message;
    return { ok: false, error: friendly };
  }

  revalidatePath("/rewards");
  revalidatePath("/dashboard");
  return { ok: true, code: (data as { code: string }).code };
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  revalidatePath("/notifications");
}
