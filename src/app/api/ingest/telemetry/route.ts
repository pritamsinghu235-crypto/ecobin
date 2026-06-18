import { NextResponse, type NextRequest } from "next/server";
import { createIngestClient } from "@/lib/supabase/ingest";

/**
 * POST /api/ingest/telemetry
 * Body: { code: string, fill: number, battery?: number }
 * Header: x-device-key: <DEVICE_INGEST_KEY>
 */
export async function POST(req: NextRequest) {
  const deviceKey = req.headers.get("x-device-key") ?? "";
  if (!deviceKey) {
    return NextResponse.json({ error: "missing device key" }, { status: 401 });
  }

  let body: { code?: string; fill?: number; battery?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.code || typeof body.fill !== "number") {
    return NextResponse.json({ error: "code and fill are required" }, { status: 400 });
  }

  const supabase = createIngestClient();
  const { error } = await supabase.rpc("ingest_telemetry", {
    p_device_key: deviceKey,
    p_code: body.code,
    p_fill: Math.round(body.fill),
    p_battery: Math.round(body.battery ?? 100),
  });

  if (error) {
    const unauthorized = error.message.includes("unauthorized");
    return NextResponse.json({ error: error.message }, { status: unauthorized ? 401 : 400 });
  }

  return NextResponse.json({ ok: true });
}
