"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MachineStatus } from "@/lib/types";

export type FormState = { ok: boolean; error?: string } | null;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, ok: (data as { role: string } | null)?.role === "admin" };
}

// ---- Machines ----

export async function createMachine(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admin access required." };

  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));

  if (!code || !name) return { ok: false, error: "Code and name are required." };
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: "Valid latitude and longitude are required." };
  }

  const { error } = await supabase.from("machines").insert({
    code,
    name,
    address: address || null,
    lat,
    lng,
    status: "active",
  });

  if (error) {
    return { ok: false, error: error.message.includes("duplicate") ? "That code already exists." : error.message };
  }

  revalidatePath("/admin/machines");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setMachineStatus(id: string, status: MachineStatus) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("machines").update({ status }).eq("id", id);
  revalidatePath("/admin/machines");
  revalidatePath("/admin");
}

export async function deleteMachine(id: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("machines").delete().eq("id", id);
  revalidatePath("/admin/machines");
  revalidatePath("/admin");
}

// ---- Rewards ----

export async function createReward(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Admin access required." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cost = Number(formData.get("cost_coins"));
  const stockRaw = String(formData.get("stock") ?? "").trim();

  if (!title) return { ok: false, error: "Title is required." };
  if (!Number.isFinite(cost) || cost < 0) return { ok: false, error: "Enter a valid coin cost." };

  const { error } = await supabase.from("rewards").insert({
    title,
    description: description || null,
    cost_coins: Math.round(cost),
    stock: stockRaw === "" ? null : Math.round(Number(stockRaw)),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
  return { ok: true };
}

export async function toggleReward(id: string, active: boolean) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("rewards").update({ active }).eq("id", id);
  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
}

export async function deleteReward(id: string) {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return;
  await supabase.from("rewards").delete().eq("id", id);
  revalidatePath("/admin/rewards");
  revalidatePath("/rewards");
}
