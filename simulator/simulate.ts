/**
 * Wastelytix · IoT device fleet simulator
 * -----------------------------------
 * Mimics a fleet of ESP32 smart bins. Each "machine" drifts its fill level,
 * occasionally registers an AI-classified bottle deposit, empties when full
 * (collection truck), and heartbeats telemetry to the backend ingestion API —
 * exactly where real ESP32 devices will POST later.
 *
 * Run:  npm run sim            (continuous, hits http://localhost:3000)
 *       npm run sim -- --dry   (no network; prints payloads)
 *       npm run sim -- --once  (single tick then exit)
 *
 * Env (from .env.local):  NEXT_PUBLIC_SUPABASE_URL is unused here;
 *   DEVICE_INGEST_KEY  — fleet credential (matches private.device_credentials)
 *   INGEST_BASE_URL    — backend base URL (default http://localhost:3000)
 */

const PLASTIC_TYPES = ["PET", "HDPE", "PVC", "LDPE", "PP"] as const;
type Plastic = (typeof PLASTIC_TYPES)[number];

// Seeded machine codes from supabase/seed.sql (A07 is offline by design).
const MACHINE_CODES = [
  "BIN-A01",
  "BIN-A02",
  "BIN-A03",
  "BIN-A04",
  "BIN-A05",
  "BIN-A06",
  "BIN-A08",
];

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry");
const ONCE = args.has("--once");
const TICK_MS = Number(process.env.SIM_TICK_MS ?? 2500);
const BASE_URL = process.env.INGEST_BASE_URL ?? "http://localhost:3000";
const DEVICE_KEY = process.env.DEVICE_INGEST_KEY ?? "";

if (!DRY && !DEVICE_KEY) {
  console.error("✗ DEVICE_INGEST_KEY is not set. Add it to .env.local or pass --dry.");
  process.exit(1);
}

type Machine = { code: string; fill: number; battery: number };

const fleet: Machine[] = MACHINE_CODES.map((code) => ({
  code,
  fill: Math.floor(Math.random() * 40) + 10,
  battery: Math.floor(Math.random() * 30) + 70,
}));

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function post(path: string, body: unknown) {
  if (DRY) {
    console.log(`  → POST ${path}`, JSON.stringify(body));
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-device-key": DEVICE_KEY },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`  ✗ ${path} ${res.status}: ${txt}`);
    }
  } catch (err) {
    console.error(`  ✗ ${path} network error:`, (err as Error).message);
  }
}

async function tick() {
  const stamp = new Date().toLocaleTimeString("en");
  const events: string[] = [];

  for (const m of fleet) {
    // ~30% chance a citizen drops a bottle this cycle.
    if (Math.random() < 0.3) {
      const plastic: Plastic = rand(PLASTIC_TYPES);
      const weight = 15 + Math.floor(Math.random() * 30);
      await post("/api/ingest/deposit", { code: m.code, plastic, weight });
      m.fill = Math.min(100, m.fill + 2);
      events.push(`${m.code} +${plastic}`);
    }

    // Background drift (passersby, settling).
    m.fill = Math.min(100, m.fill + Math.random());

    // Full → collection truck empties it.
    if (m.fill >= 98) {
      m.fill = 4;
      events.push(`${m.code} emptied 🚛`);
    }

    // Battery: slow drain, solar top-up.
    m.battery = Math.max(20, Math.min(100, m.battery - 0.3 + (Math.random() < 0.2 ? 5 : 0)));

    await post("/api/ingest/telemetry", {
      code: m.code,
      fill: Math.round(m.fill),
      battery: Math.round(m.battery),
    });
  }

  const summary = fleet.map((m) => `${m.code.slice(-3)}:${Math.round(m.fill)}%`).join("  ");
  console.log(`[${stamp}] ${summary}${events.length ? "  | " + events.join(", ") : ""}`);
}

async function main() {
  console.log(
    `▣ Wastelytix simulator — ${fleet.length} machines → ${DRY ? "DRY RUN" : BASE_URL} every ${TICK_MS}ms\n`,
  );
  await tick();
  if (ONCE) return;
  setInterval(tick, TICK_MS);
}

main();
