-- Migration: Add INSERT policy for profiles table
-- Description: Allows users to create their own profile (needed for upsert)
-- Date: 2025-10-03

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Add INSERT policy for profiles
-- This allows authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update policy with both USING and WITH CHECK for upsert
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
