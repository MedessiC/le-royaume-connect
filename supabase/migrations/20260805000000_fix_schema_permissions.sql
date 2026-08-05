-- ============================================================
-- Fix: GRANT permissions on public schema for PostgreSQL 15+
-- New Supabase projects (PG15) no longer grant public schema
-- access to anon/authenticated by default.
-- Run this in Supabase SQL Editor → New Query → Run
-- ============================================================

-- 1. Grant USAGE on the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant SELECT to anon (public visitors)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Grant full access to authenticated users (RLS will restrict further)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- 4. Grant sequence usage (needed for inserts with serial/uuid defaults)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Grant function execution
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 6. Ensure future tables/sequences/functions also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON ROUTINES TO anon, authenticated;
