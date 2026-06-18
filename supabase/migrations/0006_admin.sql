-- ============================================================
-- EcoBin · Phase 7 — admin (run in Supabase SQL Editor)
-- Role-escalation guard + admin-only analytics RPCs.
-- ============================================================

-- ---- Make yourself an admin ---------------------------------
-- Edit the email below to YOUR signup email, then run this line.
-- (Runs as the postgres role in the SQL Editor, so the guard
--  trigger below allows it — app-side role changes are blocked.)
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');

-- ---- Prevent privilege escalation from the app --------------
-- The profiles_update_own policy lets a user update their own row.
-- This trigger stops them flipping their own role via the API
-- (auth.uid() is NULL for SQL-Editor/service writes, so seeding works).
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'role changes are not permitted';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_role_change on public.profiles;
create trigger guard_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---- Admin analytics RPCs (all guarded by is_admin()) -------

create or replace function public.admin_stats()
returns table (
  total_deposits  bigint,
  total_bottles   bigint,
  total_weight_g  bigint,
  total_users     bigint,
  total_machines  bigint,
  active_machines bigint,
  avg_fill        numeric
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select
      (select count(*) from public.deposits),
      (select coalesce(sum(quantity), 0) from public.deposits),
      (select coalesce(sum(weight_g), 0) from public.deposits),
      (select count(*) from public.profiles),
      (select count(*) from public.machines),
      (select count(*) from public.machines where status = 'active'),
      (select coalesce(round(avg(fill_level), 0), 0) from public.machines);
end;
$$;

create or replace function public.admin_daily_deposits(p_days integer default 14)
returns table (day date, bottles bigint, weight bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select g.d::date,
           coalesce(sum(dep.quantity), 0)::bigint,
           coalesce(sum(dep.weight_g), 0)::bigint
    from generate_series(current_date - (p_days - 1), current_date, interval '1 day') g(d)
    left join public.deposits dep on dep.created_at::date = g.d::date
    group by g.d
    order by g.d;
end;
$$;

create or replace function public.admin_top_machines(p_limit integer default 8)
returns table (code text, name text, deposits bigint, weight bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select m.code, m.name, count(dep.id)::bigint, coalesce(sum(dep.weight_g), 0)::bigint
    from public.machines m
    left join public.deposits dep on dep.machine_id = m.id
    group by m.id, m.code, m.name
    order by count(dep.id) desc
    limit p_limit;
end;
$$;

create or replace function public.admin_plastic_split()
returns table (plastic_type plastic_type, count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select dep.plastic_type, count(*)::bigint
    from public.deposits dep
    group by dep.plastic_type
    order by count(*) desc;
end;
$$;

grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_daily_deposits(integer) to authenticated;
grant execute on function public.admin_top_machines(integer) to authenticated;
grant execute on function public.admin_plastic_split() to authenticated;
