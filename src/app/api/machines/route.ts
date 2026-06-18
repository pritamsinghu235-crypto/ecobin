import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/machines — live machine roster for the authenticated app.
 * Polled by the dashboard network panel to reflect simulator telemetry.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("machines")
    .select("id, code, name, address, lat, lng, status, fill_level, accepted_materials, last_seen_at")
    .order("code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ machines: data ?? [] });
}
