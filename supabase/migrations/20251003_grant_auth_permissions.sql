-- Migration: Grant permissions on auth.users for trigger function
-- Description: Fix "permission denied for table users" by granting proper access
-- Date: 2025-10-03

-- The handle_new_user() function needs to read from auth.users
-- Even with SECURITY DEFINER, we need to grant explicit permissions

-- Grant SELECT on auth.users to the function owner (postgres/service role)
-- This is needed for the trigger function to access auth.users
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, service_role;
GRANT SELECT ON auth.users TO postgres, authenticated, service_role;

-- Recreate the function with proper security context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;  -- Avoid errors if profile already exists
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profile when new user signs up - SECURITY DEFINER with proper permissions';
