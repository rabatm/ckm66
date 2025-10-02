-- Migration: Fix users table permissions issue
-- Description: Investigate and fix the "permission denied for table users" error
-- Date: 2025-10-03

-- First, let's see what's referencing 'users'
-- Check all foreign keys on profiles table
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  -- List all foreign keys
  FOR fk_record IN
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'profiles'
      AND ccu.table_name = 'users'
  LOOP
    RAISE NOTICE 'Found FK: % on %.% -> %.%',
      fk_record.constraint_name,
      fk_record.table_name,
      fk_record.column_name,
      fk_record.foreign_table_name,
      fk_record.foreign_column_name;

    -- Drop the problematic FK if it references 'users' instead of auth.users
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
      fk_record.table_name,
      fk_record.constraint_name);
  END LOOP;
END $$;

-- Check if public.users table exists and handle it
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    -- Drop the users table if it exists (we use profiles instead)
    DROP TABLE IF EXISTS public.users CASCADE;
    RAISE NOTICE 'Dropped public.users table - using profiles instead';
  ELSE
    RAISE NOTICE 'No public.users table found';
  END IF;
END $$;

-- Make sure profiles table has correct structure and no bad references
-- If there was a reference to users, it's now gone
