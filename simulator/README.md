# Wastelytix IoT Simulator

A standalone Node script that mimics a fleet of ESP32 smart bins so the whole
platform shows live, moving data with **no hardware required**. When real
devices arrive, they POST to the same ingestion API and nothing else changes.

## Data flow (this is the real architecture, simulated)

```
simulate.ts ──HTTP──▶  POST /api/ingest/telemetry     ──▶ ingest_telemetry()   ──▶ machines
(fake ESP32)  x-device-key   POST /api/ingest/deposit  ──▶ ingest_deposit()    ──▶ deposits
                              (Next route handler)          (SECURITY DEFINER RPC)
```

- Devices authenticate with a **device key** (`DEVICE_INGEST_KEY`), never the
  Supabase service key. The key is checked inside the RPC against the
  `private.device_credentials` table (unreadable by `anon`).
- The dashboard's **Smart Bin Network** panel polls `/api/machines` every 4s,
  so you watch fill levels and statuses move in real time.

## Prerequisites

1. Run `supabase/migrations/0003_device_simulator.sql` in the Supabase SQL Editor.
2. Ensure `DEVICE_INGEST_KEY` in `.env.local` matches the seeded credential.
3. Start the app: `npm run dev`.

## Run

```bash
npm run sim            # continuous — posts to INGEST_BASE_URL (default :3000)
npm run sim -- --once  # single tick, then exit
npm run sim -- --dry   # print payloads only, no network (no DB needed)
```

Tunables (env): `SIM_TICK_MS` (default 2500), `INGEST_BASE_URL`.

## Each tick

For every machine: ~30% chance of an AI-classified bottle deposit, a small
background fill drift, automatic emptying at ≥98% (collection truck), and a
battery model with solar top-up — then a telemetry heartbeat.
