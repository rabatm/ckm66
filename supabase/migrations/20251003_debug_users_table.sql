-- Migration: Debug and fix users table permissions
-- Description: Check if users table exists and fix permissions
-- Date: 2025-10-03

-- Check if a 'users' table exists in public schema
-- If it exists, we need to grant permissions or remove it

-- Option 1: If the table 'users' shouldn't exist, uncomment to drop it:
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Option 2: If the table 'users' exists and is needed, grant permissions:
-- First check if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'users'
  ) THEN
    -- Grant permissions on users table
    GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.users TO anon;

    -- Enable RLS if not already enabled
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Add basic policy
    DROP POLICY IF EXISTS "Users can manage own record" ON public.users;
    CREATE POLICY "Users can manage own record"
      ON public.users
      FOR ALL
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

    RAISE NOTICE 'Permissions granted on public.users table';
  ELSE
    RAISE NOTICE 'No public.users table found - using profiles table correctly';
  END IF;
END $$;

-- Ensure we're using profiles table, not users
COMMENT ON TABLE profiles IS 'Main user profiles table - DO NOT create a separate users table';
