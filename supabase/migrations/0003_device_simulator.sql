-- ============================================================
-- EcoBin · Phase 4 — IoT device ingestion (run in SQL Editor)
--
-- Mirrors a real fleet: machines (ESP32) authenticate with a
-- DEVICE KEY (never the Supabase service key) and push telemetry
-- + deposits through SECURITY DEFINER RPCs. The key is stored in
-- a `private` schema that anon/authenticated roles cannot read.
-- ============================================================

create schema if not exists private;

create table if not exists private.device_credentials (
  device_key text primary key,
  label      text,
  created_at timestamptz not null default now()
);

revoke all on private.device_credentials from anon, authenticated;

-- Seed the simulator fleet credential. The real key is NOT committed —
-- replace the placeholder below with your DEVICE_INGEST_KEY (from .env.local)
-- when first setting up, or register it via 0007 after key rotation.
insert into private.device_credentials (device_key, label)
values ('<paste DEVICE_INGEST_KEY from .env.local>', 'sim-fleet')
on conflict (device_key) do nothing;

-- Verify a device key (internal helper).
create or replace function private.check_device(p_device_key text)
returns void
language plpgsql
security definer
set search_path = private
as $$
begin
  if not exists (select 1 from private.device_credentials where device_key = p_device_key) then
    raise exception 'unauthorized device';
  end if;
end;
$$;

-- Telemetry: a machine reports its current fill + battery + heartbeat.
-- Status auto-derives (full ≥ 95%); offline/maintenance is left to admins.
create or replace function public.ingest_telemetry(
  p_device_key text,
  p_code       text,
  p_fill       integer,
  p_battery    integer default 100
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.check_device(p_device_key);

  update public.machines
     set fill_level   = least(100, greatest(0, p_fill)),
         status       = case
                          when status in ('offline', 'maintenance') then status
                          when p_fill >= 95 then 'full'::machine_status
                          else 'active'::machine_status
                        end,
         last_seen_at = now()
   where code = p_code;
end;
$$;

-- Anonymous deposit: a bottle dropped at a machine, not attributed to a
-- signed-in citizen (city-wide usage stats). Records the deposit, awards
-- nothing to a user, and bumps the machine fill.
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
  v_coins   integer;
begin
  perform private.check_device(p_device_key);

  select * into v_machine from public.machines where code = p_code;
  if not found then
    raise exception 'unknown machine %', p_code;
  end if;

  v_coins := greatest(1, round(p_weight_g * 0.45))::integer;

  insert into public.deposits
    (user_id, machine_id, plastic_type, quantity, weight_g, coins_awarded, impact_points)
  values
    (null, v_machine.id, p_plastic_type, 1, p_weight_g, v_coins, greatest(1, round(p_weight_g * 0.4))::integer);

  update public.machines
     set fill_level   = least(100, fill_level + 2),
         last_seen_at = now()
   where id = v_machine.id;
end;
$$;

grant execute on function public.ingest_telemetry(text, text, integer, integer) to anon, authenticated;
grant execute on function public.ingest_deposit(text, text, plastic_type, integer) to anon, authenticated;
