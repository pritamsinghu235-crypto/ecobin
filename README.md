# ♻️ Wastelytix — Turn Waste Into Value

An AI-powered smart-bin platform. Citizens deposit plastic bottles into smart
collection machines, earn coins, climb a city leaderboard, and track their
environmental impact. Managers monitor the fleet and analytics from an admin
dashboard. Built as a **software-first showcase prototype** — the IoT hardware
is fully simulated and swaps in later without code changes.

> Apple-minimal × smart-city × futuristic dashboard. Dark, glassmorphic, animated.

---

## ✨ Features

**Citizens**
- Email/password auth, personal dashboard with live KPIs (bottles, weight, coins, impact)
- Activity & plastic-breakdown charts, full deposit history
- Interactive map of smart bins with live fill levels + "nearest available" (PostGIS)
- Coin rewards catalog with atomic redemption, achievements/badges, notifications
- City-wide leaderboard with your rank

**Admin** (role-gated)
- City analytics (collection volume, plastic mix, most-active locations)
- Machine management (add/remove, status), user roster, reward-catalog management

**IoT**
- Device simulator → ingestion API → guarded database RPCs (the real architecture)
- Live telemetry (fill level, status, battery) the dashboard & map reflect in real time

---

## 🧱 Tech Stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, React 19, Turbopack) + TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens), custom glassmorphism UI |
| Charts | Recharts · Maps: MapLibre GL + free CARTO dark tiles |
| Backend | Next.js Route Handlers + Server Actions |
| Database / Auth | Supabase (PostgreSQL + PostGIS, Row-Level Security, `@supabase/ssr`) |
| IoT | Standalone Node simulator → ingestion API → SECURITY DEFINER RPCs |
| Deploy | Vercel (app) + Supabase (DB/auth) |

---

## 🚀 Local Setup

### 1. Install
```bash
npm install
```

### 2. Environment
Copy the template and fill in your Supabase project values:
```bash
cp .env.example .env.local
```
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx   # publishable/anon (client-safe)
DEVICE_INGEST_KEY=dev_sim_xxx                       # fleet credential (server-only)
INGEST_BASE_URL=http://localhost:3000               # used by the simulator only
```

### 3. Database
Run the migrations **in order** in the Supabase SQL Editor, then the seed:

| File | Adds |
|------|------|
| `supabase/migrations/0001_init.sql` | core tables, RLS, profile trigger, leaderboard() |
| `supabase/seed.sql` | 8 demo machines + 6 rewards |
| `supabase/migrations/0002_record_deposit.sql` | atomic deposit + reward RPC |
| `supabase/migrations/0003_device_simulator.sql` | device credentials + ingestion RPCs |
| `supabase/migrations/0004_nearest_machines.sql` | PostGIS nearest-machine RPC |
| `supabase/migrations/0005_gamification.sql` | badges, redemption, ranked leaderboard |
| `supabase/migrations/0006_admin.sql` | role guard + admin analytics RPCs |

> Make sure `DEVICE_INGEST_KEY` in `.env.local` matches the value seeded in `0003`.

### 4. Run
```bash
npm run dev          # app at http://localhost:3000
npm run sim          # (separate terminal) live IoT telemetry — see simulator/README.md
```

### 5. Become an admin
In `0006_admin.sql`, uncomment the promotion line, set your signup email, and run it:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. **Import** the project at [vercel.com/new](https://vercel.com/new) (framework auto-detected as Next.js).
3. Add **Environment Variables** (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DEVICE_INGEST_KEY`
   *(`INGEST_BASE_URL` is only used by the local simulator — no need to set it on Vercel.)*
4. **Deploy.** Default build command `next build` works as-is.
5. In **Supabase → Authentication → URL Configuration**, set the **Site URL** to your
   Vercel domain (and add it to the redirect allow-list) so auth flows resolve in production.

### Run the simulator against production
```bash
INGEST_BASE_URL=https://your-app.vercel.app npm run sim
```

---

## 🗂️ Project Structure

```
src/
  app/
    (auth)/            login, signup, auth server actions
    (app)/             citizen shell — dashboard, history, leaderboard,
                       rewards, map, notifications (+ deposit action)
    admin/             role-gated admin area (overview, machines, users, rewards)
    api/               ingestion (telemetry/deposit) + machines endpoints
    proxy.ts           Next 16 proxy — session refresh + route gating
  components/          ui/, layout/, dashboard/, map/, rewards/, admin/, …
  lib/                 supabase clients, data queries, types, helpers
simulator/             standalone IoT fleet simulator
supabase/              SQL migrations + seed
```

---

## 🔒 Security Notes

- **Rewards are server-authoritative** — devices report measurements; the database
  computes coins/impact. Clients never write rewards directly.
- **Row-Level Security** on every table; admin-only writes via `is_admin()`.
- Devices authenticate with a **device key** (not the Supabase service key), checked
  inside SECURITY DEFINER RPCs against a `private` table clients can't read.
- A trigger blocks role escalation from the app.

---

*Showcase prototype — hardware (ESP32 + weight/ultrasonic/IR sensors + camera AI)
connects to the same ingestion API the simulator uses.*
