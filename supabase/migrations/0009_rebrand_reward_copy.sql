-- ============================================================
-- Wastelytix · 0009 — rebrand leftover reward copy
-- (run in Supabase SQL Editor)
--
-- The Tote Bag reward row was seeded (0001/seed.sql) before the
-- EcoBin -> Wastelytix rebrand, so its description still reads "EcoBin"
-- in existing databases. seed.sql is already corrected for fresh
-- installs; this updates the live row. Targeted + idempotent (matches
-- the old text, so re-running is a no-op once applied).
-- ============================================================

update public.rewards
   set description = 'Recycled-canvas Wastelytix tote.'
 where description = 'Recycled-canvas EcoBin tote.';
