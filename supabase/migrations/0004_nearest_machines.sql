-- ============================================================
-- EcoBin · Phase 5 — nearest available machine (PostGIS)
-- (run in Supabase SQL Editor after 0003)
--
-- Uses the `location` geography column + GiST index for a fast
-- KNN ("<->") nearest-neighbour search. SECURITY INVOKER (default)
-- so the machines RLS policy still applies to the caller.
-- ============================================================

create or replace function public.nearest_machines(
  p_lat   double precision,
  p_lng   double precision,
  p_limit integer default 5,
  p_available_only boolean default true
)
returns table (
  id uuid,
  code text,
  name text,
  address text,
  lat double precision,
  lng double precision,
  status machine_status,
  fill_level smallint,
  distance_m double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select m.id, m.code, m.name, m.address, m.lat, m.lng, m.status, m.fill_level,
         extensions.st_distance(
           m.location,
           extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::geography
         ) as distance_m
  from public.machines m
  where (not p_available_only) or m.status = 'active'
  order by m.location <-> extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::geography
  limit p_limit;
$$;

grant execute on function public.nearest_machines(double precision, double precision, integer, boolean)
  to authenticated;
