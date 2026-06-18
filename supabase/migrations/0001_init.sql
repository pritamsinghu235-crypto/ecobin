-- ============================================================
-- EcoBin · Phase 2 schema (run in Supabase SQL Editor)
-- Citizens, smart machines, deposits, coin ledger, rewards.
-- Plastic-bottle MVP with a 5-type plastic enum for AI output.
-- ============================================================

-- Extensions ---------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists postgis with schema extensions;

-- Enums --------------------------------------------------------
do $$ begin
  create type user_role as enum ('citizen', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plastic_type as enum ('PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'OTHER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type machine_status as enum ('active', 'full', 'offline', 'maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coin_txn_type as enum ('deposit_reward', 'redemption', 'bonus', 'adjustment');
exception when duplicate_object then null; end $$;

-- Profiles -----------------------------------------------------
-- NOTE: created before is_admin(), because is_admin() is a `language sql`
-- function and Postgres resolves its body (including the reference to
-- public.profiles) at CREATE FUNCTION time, not at call time.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text not null default 'Citizen',
  role          user_role not null default 'citizen',
  coins_balance integer not null default 0,
  total_bottles integer not null default 0,
  total_weight_g integer not null default 0,
  impact_score  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Citizen'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin? (security definer avoids
-- RLS recursion when policies reference the profiles table.)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Machines -----------------------------------------------------
create table if not exists public.machines (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  address     text,
  lat         double precision not null,
  lng         double precision not null,
  location    geography(Point, 4326)
                generated always as
                (extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::geography) stored,
  status      machine_status not null default 'active',
  fill_level  smallint not null default 0 check (fill_level between 0 and 100),
  accepted_materials text[] not null default array['PET','HDPE','PVC','LDPE','PP'],
  capacity_g  integer not null default 50000,
  last_seen_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists machines_location_idx on public.machines using gist (location);

-- Deposits (central fact table) --------------------------------
create table if not exists public.deposits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles (id) on delete set null,
  machine_id    uuid references public.machines (id) on delete set null,
  plastic_type  plastic_type not null default 'PET',
  quantity      integer not null default 1 check (quantity > 0),
  weight_g      integer not null default 0,
  coins_awarded integer not null default 0,
  impact_points integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists deposits_user_idx on public.deposits (user_id, created_at desc);
create index if not exists deposits_machine_idx on public.deposits (machine_id, created_at desc);

-- Coin ledger (append-only) ------------------------------------
create table if not exists public.coin_transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  amount        integer not null,
  type          coin_txn_type not null,
  reference_id  uuid,
  balance_after integer not null,
  created_at    timestamptz not null default now()
);
create index if not exists coin_txn_user_idx on public.coin_transactions (user_id, created_at desc);

-- Rewards ------------------------------------------------------
create table if not exists public.rewards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  cost_coins  integer not null check (cost_coins >= 0),
  stock       integer,
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  reward_id   uuid not null references public.rewards (id),
  cost_coins  integer not null,
  status      text not null default 'pending',
  code        text,
  created_at  timestamptz not null default now()
);

-- Notifications ------------------------------------------------
create table if not exists public.notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles (id) on delete cascade,
  type      text not null default 'info',
  title     text not null,
  body      text,
  read_at   timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.machines            enable row level security;
alter table public.deposits            enable row level security;
alter table public.coin_transactions   enable row level security;
alter table public.rewards             enable row level security;
alter table public.reward_redemptions  enable row level security;
alter table public.notifications       enable row level security;

-- Profiles: read/update own; admins read all.
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Machines: anyone authenticated can read; admins manage.
create policy "machines_select_all" on public.machines
  for select using (auth.role() = 'authenticated');
create policy "machines_admin_write" on public.machines
  for all using (public.is_admin()) with check (public.is_admin());

-- Deposits: read own (or admin); insert own (prototype/simulator).
create policy "deposits_select_own" on public.deposits
  for select using (user_id = auth.uid() or public.is_admin());
create policy "deposits_insert_own" on public.deposits
  for insert with check (user_id = auth.uid());

-- Coin transactions: read own (or admin). Writes via service role.
create policy "coin_txn_select_own" on public.coin_transactions
  for select using (user_id = auth.uid() or public.is_admin());

-- Rewards: read public; admins manage.
create policy "rewards_select_all" on public.rewards
  for select using (auth.role() = 'authenticated');
create policy "rewards_admin_write" on public.rewards
  for all using (public.is_admin()) with check (public.is_admin());

-- Redemptions: read/insert own; admins read all.
create policy "redemptions_select_own" on public.reward_redemptions
  for select using (user_id = auth.uid() or public.is_admin());
create policy "redemptions_insert_own" on public.reward_redemptions
  for insert with check (user_id = auth.uid());

-- Notifications: read/update own.
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Leaderboard: a SECURITY DEFINER view-style function so the
-- ranking can read aggregate profile data without exposing rows.
create or replace function public.leaderboard(limit_count integer default 20)
returns table (rank bigint, full_name text, total_bottles integer, impact_score integer, coins_balance integer)
language sql
security definer
set search_path = public
stable
as $$
  select row_number() over (order by p.total_bottles desc, p.impact_score desc) as rank,
         p.full_name, p.total_bottles, p.impact_score, p.coins_balance
  from public.profiles p
  order by p.total_bottles desc, p.impact_score desc
  limit limit_count;
$$;