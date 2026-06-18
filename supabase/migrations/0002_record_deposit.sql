-- ============================================================
-- EcoBin · Phase 3 — atomic, server-authoritative deposit RPC
-- (run in Supabase SQL Editor after 0001 + seed)
--
-- The device/client NEVER computes rewards. This SECURITY DEFINER
-- function is the single source of truth: it records the deposit,
-- awards coins + impact, appends to the coin ledger, updates the
-- user's running totals, and nudges the machine fill level — all
-- in one transaction. The Phase 4 device simulator calls this too.
-- ============================================================

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
  v_coins       integer;
  v_impact      integer;
  v_deposit     public.deposits;
  v_new_balance integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_quantity < 1 or p_weight_g < 1 then
    raise exception 'invalid deposit';
  end if;

  -- Coin value scales with weight and plastic grade.
  v_coins := greatest(1, round(p_weight_g * case p_plastic_type
      when 'PET'  then 0.50
      when 'HDPE' then 0.60
      when 'PVC'  then 0.30
      when 'LDPE' then 0.35
      when 'PP'   then 0.45
      else 0.20
    end))::integer;
  v_impact := greatest(1, round(p_weight_g * 0.40))::integer;

  insert into public.deposits
    (user_id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points)
  values
    (v_user, p_machine_id, p_plastic_type, p_quantity, p_weight_g, v_coins, v_impact)
  returning * into v_deposit;

  update public.profiles
     set coins_balance  = coins_balance + v_coins,
         total_bottles  = total_bottles + p_quantity,
         total_weight_g = total_weight_g + p_weight_g,
         impact_score   = impact_score + v_impact
   where id = v_user
   returning coins_balance into v_new_balance;

  insert into public.coin_transactions
    (user_id, amount, type, reference_id, balance_after)
  values
    (v_user, v_coins, 'deposit_reward', v_deposit.id, v_new_balance);

  update public.machines
     set fill_level = least(100, fill_level + 1),
         last_seen_at = now()
   where id = p_machine_id;

  return v_deposit;
end;
$$;

grant execute on function public.record_deposit(uuid, plastic_type, integer, integer) to authenticated;
