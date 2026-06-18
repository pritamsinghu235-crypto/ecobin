import { createClient } from "@supabase/supabase-js";

/**
 * A stateless (cookieless) Supabase client for the IoT ingestion API.
 * Requests arrive from devices/simulator, not browsers — there is no
 * user session. Writes go through device-key-guarded SECURITY DEFINER
 * RPCs, so the anon key is sufficient.
 */
export function createIngestClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
