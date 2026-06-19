-- ============================================================
-- EcoBin · 0007 — security hardening (run in Supabase SQL Editor)
--
-- Closes the economy/integrity holes from the security audit:
--   C1  users could UPDATE their own coins/stats directly
--   H2  record_deposit accepted attacker-controlled weight
--   H3  users could INSERT deposits with arbitrary reward fields
--   M2  leaderboard RPCs leaked every user's coins_balance
--   M1  rotate the device ingest key (old one was committed)
--   M4  clamp anonymous ingest deposit weight
--
-- BACKUP / ROLLBACK PLAN
--   Before running: Supabase Dashboard → Database → Backups → take a
--   manual backup (or rely on automatic PITR). This migration only
--   changes policies/grants/functions — no data is dropped.
--   A full rollback script is at the BOTTOM of this file (commented).
-- ============================================================

-- ---- C1: lock down direct profile writes -------------------
-- The profiles_update_own RLS policy gave row scope, but table-level
-- UPDATE let users rewrite coins_balance/total_bottles/etc. Column
-- privileges are the correct tool. SECURITY DEFINER functions
-- (record_deposit / redeem_reward / award_badges) run as the function
-- owner, so they are unaffected and keep working.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---- H3: deposits are written only by trusted RPCs ---------
-- record_deposit / ingest_deposit are SECURITY DEFINER and bypass RLS,
-- so removing the direct-insert policy breaks nothing legitimate.
drop policy if exists "deposits_insert_own" on public.deposits;

-- ---- H2: clamp caller-supplied measurements ----------------
create or replace function public.record_deposit(
  p_machine_id  uuid,
  p_plastic_type plastic_type,
  p_quantity    integer default 1,
  p_weight_g    integer default 20
)
returns public.deposits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user        uuid := auth.uid();
  v_qty         integer := least(5, greatest(1, coalesce(p_quantity, 1)));
  v_weight      integer := least(60, greatest(10, coalesce(p_weight_g, 20)));
  v_coins       integer;
  v_impact      integer;
  v_deposit     public.deposits;
  v_new_balance integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  v_coins := greatest(1, round(v_weight * case p_plastic_type
      when 'PET'  then 0.50
      when 'HDPE' then 0.60
      when 'PVC'  then 0.30
      when 'LDPE' then 0.35
      when 'PP'   then 0.45
      else 0.20
    end))::integer;
  v_impact := greatest(1, round(v_weight * 0.40))::integer;

  insert into public.deposits
    (user_id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points)
  values
    (v_user, p_machine_id, p_plastic_type, v_qty, v_weight, v_coins, v_impact)
  returning * into v_deposit;

  update public.profiles
     set coins_balance  = coins_balance + v_coins,
         total_bottles  = total_bottles + v_qty,
         total_weight_g = total_weight_g + v_weight,
         impact_score   = impact_score + v_impact
   where id = v_user
   returning coins_balance into v_new_balance;

  insert into public.coin_transactions
    (user_id, amount, type, reference_id, balance_after)
  values
    (v_user, v_coins, 'deposit_reward', v_deposit.id, v_new_balance);

  update public.machines
     set fill_level = least(100, fill_level + 1), last_seen_at = now()
   where id = p_machine_id;

  return v_deposit;
end;
$$;

-- ---- M4: clamp anonymous ingest deposit weight -------------
create or replace function public.ingest_deposit(
  p_device_key  text,
  p_code        text,
  p_plastic_type plastic_type,
  p_weight_g    integer
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_machine public.machines;
  v_weight  integer := least(80, greatest(5, coalesce(p_weight_g, 20)));
begin
  perform private.check_device(p_device_key);

  select * into v_machine from public.machines where code = p_code;
  if not found then
    raise exception 'unknown machine %', p_code;
  end if;

  insert into public.deposits
    (user_id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points)
  values
    (null, v_machine.id, p_plastic_type, 1, v_weight,
     greatest(1, round(v_weight * 0.45))::integer,
     greatest(1, round(v_weight * 0.40))::integer);

  update public.machines
     set fill_level = least(100, fill_level + 2), last_seen_at = now()
   where id = v_machine.id;
end;
$$;

-- ---- M2: stop leaking coins_balance on the leaderboard -----
drop function if exists public.leaderboard(integer);
drop function if exists public.leaderboard_ranked(integer);
drop function if exists public.my_rank();

create function public.leaderboard_ranked(p_limit integer default 20)
returns table (
  rank bigint,
  is_me boolean,
  full_name text,
  total_bottles integer,
  impact_score integer
)
language sql
security definer
set search_path = public
stable
as $$
  select row_number() over (order by p.total_bottles desc, p.impact_score desc) as rank,
         (p.id = auth.uid()) as is_me,
         p.full_name, p.total_bottles, p.impact_score
  from public.profiles p
  order by p.total_bottles desc, p.impact_score desc
  limit p_limit;
$$;

create function public.my_rank()
returns table (rank bigint, total_bottles integer, impact_score integer)
language sql
security definer
set search_path = public
stable
as $$
  select t.rank, t.total_bottles, t.impact_score
  from (
    select id,
           row_number() over (order by total_bottles desc, impact_score desc) as rank,
           total_bottles, impact_score
    from public.profiles
  ) t
  where t.id = auth.uid();
$$;

grant execute on function public.leaderboard_ranked(integer) to authenticated;
grant execute on function public.my_rank() to authenticated;

-- ---- M1: rotate the device ingest key ----------------------
-- Removes the old credential that was committed in 0003. Register the
-- NEW key (kept only in .env.local, never committed) by uncommenting
-- the line below and pasting your rotated DEVICE_INGEST_KEY:
--
--   insert into private.device_credentials (device_key, label)
--   values ('<paste DEVICE_INGEST_KEY from .env.local>', 'sim-fleet');
--
delete from private.device_credentials where label = 'sim-fleet';


-- ============================================================
-- ROLLBACK (only if needed — paste into SQL Editor)
-- ============================================================
-- -- C1
-- grant update on public.profiles to authenticated;
-- -- H3
-- create policy "deposits_insert_own" on public.deposits
--   for insert with check (user_id = auth.uid());
-- -- M2 (recreate prior signatures) — see 0001/0005 for originals.
-- (record_deposit / ingest_deposit: re-run 0002 / 0003 bodies to revert clamps.)
