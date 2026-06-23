-- ============================================================
-- Wastelytix · 0008 — points-threshold achievement badges
-- (run in Supabase SQL Editor AFTER 0005 + 0007)
--
-- Model A: impact_score IS "points" (lifetime, never decreases).
-- This migration:
--   1. Seeds lower point-tier badges (metric = impact_score).
--   2. Hardens award_badges() against a duplicate-insert race.
--   3. Wires award_badges() into record_deposit so crossing a point
--      threshold auto-unlocks a badge, server-side, on every deposit.
--
-- No new tables. No points_balance column. No new ledger. The existing
-- badges / user_badges / award_badges() are reused.
--
-- SECURITY: award_badges() and record_deposit stay SECURITY DEFINER.
-- No grants or RLS policies are added or loosened — users still cannot
-- write impact_score (0007: profiles UPDATE is full_name-only) or insert
-- user_badges directly (no INSERT policy; only the definer function does).
--
-- NOTE on ingest_deposit: deliberately NOT modified. Its deposits are
-- anonymous (user_id = null), so there is no profile to credit points to
-- and no user to award a badge to. Its 0007 weight clamp is untouched.
-- ============================================================

-- 1) New point-tier badges (metric = impact_score = points).
--    Existing impact_score badges continue the ladder: eco_warrior(1000),
--    guardian(5000). idempotent via the unique `key`.
insert into public.badges (key, name, description, icon, metric, threshold, sort) values
  ('points_50',  'Green Starter',   'Earned 50 impact points.',  'Sparkles', 'impact_score', 50,  7),
  ('points_100', 'Eco Achiever',    'Earned 100 impact points.', 'Star',     'impact_score', 100, 8),
  ('points_500', 'Impact Champion', 'Earned 500 impact points.', 'Gem',      'impact_score', 500, 9)
on conflict (key) do nothing;

-- 2) award_badges() — identical to 0005 plus `on conflict do nothing` on
--    the user_badges insert. Now that this runs inside record_deposit's
--    transaction, a rare same-user concurrent deposit crossing the same
--    threshold can no longer raise a PK violation and roll back the deposit.
create or replace function public.award_badges()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_bottles integer;
  v_impact  integer;
  v_count   integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select total_bottles, impact_score into v_bottles, v_impact
  from public.profiles where id = v_user;

  with eligible as (
    select b.id, b.name, b.description
    from public.badges b
    where not exists (
      select 1 from public.user_badges ub
      where ub.user_id = v_user and ub.badge_id = b.id
    )
    and (
      (b.metric = 'total_bottles' and coalesce(v_bottles, 0) >= b.threshold) or
      (b.metric = 'impact_score'  and coalesce(v_impact, 0)  >= b.threshold)
    )
  ),
  inserted as (
    insert into public.user_badges (user_id, badge_id)
    select v_user, id from eligible
    on conflict (user_id, badge_id) do nothing
    returning badge_id
  )
  insert into public.notifications (user_id, type, title, body)
  select v_user, 'badge', 'Badge unlocked: ' || e.name, e.description
  from eligible e;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.award_badges() to authenticated;

-- 3) record_deposit — body identical to 0007 (weight/qty clamps preserved);
--    only the marked PERFORM is added. Same signature + SECURITY DEFINER, so
--    CREATE OR REPLACE preserves the existing grant.
create or replace function public.record_deposit(
  p_machine_id   uuid,
  p_plastic_type plastic_type,
  p_quantity     integer default 1,
  p_weight_g     integer default 20
)
returns public.deposits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user        uuid := auth.uid();
  v_qty         integer := least(5, greatest(1, coalesce(p_quantity, 1)));     -- 0007 clamp (preserved)
  v_weight      integer := least(60, greatest(10, coalesce(p_weight_g, 20)));  -- 0007 clamp (preserved)
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

  -- NEW (0008): unlock any newly-crossed point/bottle thresholds in the
  -- SAME transaction. auth.uid() persists across the nested SECURITY
  -- DEFINER call, so badges land on the depositing user. Idempotent.
  perform public.award_badges();

  return v_deposit;
end;
$$;

grant execute on function public.record_deposit(uuid, plastic_type, integer, integer) to authenticated;
