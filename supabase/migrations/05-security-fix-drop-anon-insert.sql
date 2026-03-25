-- ═══════════════════════════════════════════════════════════════════════════════
-- Security Fix: Remove dangerous anon INSERT policy on users table
-- ═══════════════════════════════════════════════════════════════════════════════
-- Problem: users_insert_anon allowed any unauthenticated user to insert
-- arbitrary rows into public.users with WITH CHECK (true).
-- The handle_new_user() trigger already creates user records via SECURITY DEFINER,
-- so this policy is unnecessary and exploitable.
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "users_insert_anon" ON public.users;
