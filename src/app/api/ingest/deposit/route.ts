import { NextResponse, type NextRequest } from "next/server";
import { createIngestClient } from "@/lib/supabase/ingest";
import { PLASTIC_TYPES, type PlasticType } from "@/lib/types";

/**
 * POST /api/ingest/deposit
 * Body: { code: string, plastic: PlasticType, weight: number }
 * Header: x-device-key: <DEVICE_INGEST_KEY>
 *
 * Represents a bottle dropped at a machine (city-wide usage, no user).
 */
export async function POST(req: NextRequest) {
  const deviceKey = req.headers.get("x-device-key") ?? "";
  if (!deviceKey) {
    return NextResponse.json({ error: "missing device key" }, { status: 401 });
  }

  let body: { code?: string; plastic?: string; weight?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const plastic = body.plastic as PlasticType;
  if (!body.code || !PLASTIC_TYPES.includes(plastic) || typeof body.weight !== "number") {
    return NextResponse.json({ error: "code, valid plastic, and weight are required" }, { status: 400 });
  }

  const supabase = createIngestClient();
  const { error } = await supabase.rpc("ingest_deposit", {
    p_device_key: deviceKey,
    p_code: body.code,
    p_plastic_type: plastic,
    p_weight_g: Math.round(body.weight),
  });

  if (error) {
    const unauthorized = error.message.includes("unauthorized");
    return NextResponse.json({ error: error.message }, { status: unauthorized ? 401 : 400 });
  }

  return NextResponse.json({ ok: true });
}
