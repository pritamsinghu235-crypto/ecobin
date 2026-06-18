import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/machines/nearest?lat=&lng=&limit=
 * Returns the nearest available machines via the PostGIS RPC.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 3);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "valid lat and lng are required" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("nearest_machines", {
    p_lat: lat,
    p_lng: lng,
    p_limit: limit,
    p_available_only: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ machines: data ?? [] });
}
