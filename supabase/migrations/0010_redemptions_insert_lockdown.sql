-- ============================================================
-- Wastelytix · 0010 — close the reward_redemptions insert bypass
-- (run in Supabase SQL Editor)
--
-- SECURITY FIX (economy integrity). 0001 created `redemptions_insert_own`,
-- letting an authenticated user INSERT a reward_redemptions row directly
-- (with check user_id = auth.uid()). That bypasses redeem_reward(), which
-- is the only path that checks the coin balance, debits coins, decrements
-- stock, and mints the ECO-xxxx code — so a user could fabricate a
-- "fulfilled" redemption (cost_coins = 0, arbitrary code) without paying.
--
-- This is the direct analogue of the deposits_insert_own hole closed in
-- 0007 (H3); the redemptions twin was left in place. redeem_reward() is
-- SECURITY DEFINER and bypasses RLS, so legitimate redemptions are
-- unaffected by removing the policy. SELECT-own (and admin-all) remain.
-- ============================================================

drop policy if exists "redemptions_insert_own" on public.reward_redemptions;


-- ============================================================
-- ROLLBACK (only if needed — paste into SQL Editor)
-- ============================================================
-- create policy "redemptions_insert_own" on public.reward_redemptions
--   for insert with check (user_id = auth.uid());
