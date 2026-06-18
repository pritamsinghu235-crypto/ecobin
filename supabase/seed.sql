-- ============================================================
-- EcoBin · seed data (run after 0001_init.sql)
-- Smart machines around a sample city + reward catalog.
-- Coordinates are around central London for the demo map.
-- ============================================================

insert into public.machines (code, name, address, lat, lng, status, fill_level) values
  ('BIN-A01', 'City Hall Plaza',       '1 City Hall Sq',        51.5079, -0.0877, 'active',      32),
  ('BIN-A02', 'Riverside Walk',        'South Bank',            51.5060, -0.1140, 'active',      58),
  ('BIN-A03', 'Central Station',       'Liverpool St',          51.5179, -0.0817, 'full',        96),
  ('BIN-A04', 'Greenpark Entrance',    'Green Park',            51.5028, -0.1426, 'active',      14),
  ('BIN-A05', 'University Campus',      'Malet St',             51.5215, -0.1300, 'maintenance', 41),
  ('BIN-A06', 'Market Square',         'Borough Market',        51.5055, -0.0905, 'active',      77),
  ('BIN-A07', 'Tech Park North',       'Old St Roundabout',     51.5256, -0.0876, 'offline',     63),
  ('BIN-A08', 'Harbour Promenade',     'Canary Wharf',          51.5054, -0.0235, 'active',      22)
on conflict (code) do nothing;

insert into public.rewards (title, description, cost_coins, stock, active) values
  ('Reusable Coffee Cup',  'Eco bamboo-fibre travel cup.',           500,  120, true),
  ('Bus Day Pass',         'One-day city transit pass.',             800,  500, true),
  ('Plant a Tree',         'We plant a tree in your name.',          300, null, true),
  ('£5 Grocery Voucher',   'Redeemable at partner stores.',         1000,  300, true),
  ('Tote Bag',             'Recycled-canvas EcoBin tote.',           400,   80, true),
  ('Cinema Ticket',        'Standard ticket at partner cinemas.',   1500,  100, true)
on conflict do nothing;
