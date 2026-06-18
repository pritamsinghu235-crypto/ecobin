-- ============================================================
-- EcoBin · Phase 6 — gamification (run in Supabase SQL Editor)
-- Badges, atomic reward redemption, and ranked leaderboard RPCs.
-- ============================================================

-- Badges -------------------------------------------------------
create table if not exists public.badges (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name        text not null,
  description text not null,
  icon        text not null default 'Award',  -- lucide icon name
  metric      text not null,                  -- 'total_bottles' | 'impact_score'
  threshold   integer not null,
  sort        integer not null default 0
);

create table if not exists public.user_badges (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  badge_id  uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table public.badges      enable row level security;
alter table public.user_badges enable row level security;

create policy "badges_select_all" on public.badges
  for select using (auth.role() = 'authenticated');
create policy "user_badges_select_own" on public.user_badges
  for select using (user_id = auth.uid() or public.is_admin());

insert into public.badges (key, name, description, icon, metric, threshold, sort) values
  ('first_drop',  'First Drop',      'Recycled your very first bottle.',      'Sprout',  'total_bottles', 1,    1),
  ('getting_go',  'Getting Going',   'Recycled 10 bottles.',                  'Recycle', 'total_bottles', 10,   2),
  ('century',     'Century Club',    'Recycled 100 bottles.',                 'Medal',   'total_bottles', 100,  3),
  ('hero',        'Recycling Hero',  'Recycled 500 bottles.',                 'Trophy',  'total_bottles', 500,  4),
  ('eco_warrior', 'Eco Warrior',     'Reached an impact score of 1,000.',     'Leaf',    'impact_score',  1000, 5),
  ('guardian',    'Planet Guardian', 'Reached an impact score of 5,000.',     'Globe',   'impact_score',  5000, 6)
on conflict (key) do nothing;

-- Award any newly-earned badges to the caller, with a notification each.
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

-- Atomic reward redemption ------------------------------------
create or replace function public.redeem_reward(p_reward_id uuid)
returns public.reward_redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user       uuid := auth.uid();
  v_reward     public.rewards;
  v_balance    integer;
  v_code       text;
  v_redemption public.reward_redemptions;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select * into v_reward from public.rewards where id = p_reward_id and active for update;
  if not found then
    raise exception 'reward not available';
  end if;
  if v_reward.stock is not null and v_reward.stock <= 0 then
    raise exception 'out of stock';
  end if;

  select coins_balance into v_balance from public.profiles where id = v_user for update;
  if v_balance < v_reward.cost_coins then
    raise exception 'insufficient coins';
  end if;

  v_code := 'ECO-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));

  update public.profiles
     set coins_balance = coins_balance - v_reward.cost_coins
   where id = v_user
   returning coins_balance into v_balance;

  insert into public.coin_transactions (user_id, amount, type, reference_id, balance_after)
  values (v_user, -v_reward.cost_coins, 'redemption', p_reward_id, v_balance);

  if v_reward.stock is not null then
    update public.rewards set stock = stock - 1 where id = p_reward_id;
  end if;

  insert into public.reward_redemptions (user_id, reward_id, cost_coins, status, code)
  values (v_user, p_reward_id, v_reward.cost_coins, 'fulfilled', v_code)
  returning * into v_redemption;

  insert into public.notifications (user_id, type, title, body)
  values (v_user, 'reward', 'Reward redeemed', v_reward.title || ' · code ' || v_code);

  return v_redemption;
end;
$$;

grant execute on function public.redeem_reward(uuid) to authenticated;

-- Ranked leaderboard + caller's own rank ----------------------
create or replace function public.leaderboard_ranked(p_limit integer default 20)
returns table (
  rank bigint,
  is_me boolean,
  full_name text,
  total_bottles integer,
  impact_score integer,
  coins_balance integer
)
language sql
security definer
set search_path = public
stable
as $$
  select row_number() over (order by p.total_bottles desc, p.impact_score desc) as rank,
         (p.id = auth.uid()) as is_me,
         p.full_name, p.total_bottles, p.impact_score, p.coins_balance
  from public.profiles p
  order by p.total_bottles desc, p.impact_score desc
  limit p_limit;
$$;

create or replace function public.my_rank()
returns table (rank bigint, total_bottles integer, impact_score integer, coins_balance integer)
language sql
security definer
set search_path = public
stable
as $$
  select t.rank, t.total_bottles, t.impact_score, t.coins_balance
  from (
    select id,
           row_number() over (order by total_bottles desc, impact_score desc) as rank,
           total_bottles, impact_score, coins_balance
    from public.profiles
  ) t
  where t.id = auth.uid();
$$;

grant execute on function public.leaderboard_ranked(integer) to authenticated;
grant execute on function public.my_rank() to authenticated;
