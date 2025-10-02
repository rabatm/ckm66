-- Migration: Auto-check badges on profile changes
-- Description: Automatically checks and unlocks badges when profile is created or updated
-- Date: 2025-10-03

-- ============================================================================
-- TRIGGER: Auto-check badges on profile INSERT/UPDATE
-- ============================================================================

-- Function to automatically check badges after profile changes
CREATE OR REPLACE FUNCTION auto_check_badges_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Call check_and_unlock_badges for the user
  -- This will check all automatic badges and unlock eligible ones
  PERFORM check_and_unlock_badges(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_check_badges_on_insert ON profiles;
DROP TRIGGER IF EXISTS trigger_auto_check_badges_on_update ON profiles;

-- Trigger on INSERT (when profile is created)
CREATE TRIGGER trigger_auto_check_badges_on_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_check_badges_on_profile_change();

-- Trigger on UPDATE (when profile stats change)
-- Only trigger when relevant fields change
CREATE TRIGGER trigger_auto_check_badges_on_update
  AFTER UPDATE OF total_classes, current_streak, attendance_rate, first_name, last_name, phone
  ON profiles
  FOR EACH ROW
  WHEN (
    OLD.total_classes IS DISTINCT FROM NEW.total_classes OR
    OLD.current_streak IS DISTINCT FROM NEW.current_streak OR
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.phone IS DISTINCT FROM NEW.phone
  )
  EXECUTE FUNCTION auto_check_badges_on_profile_change();

-- ============================================================================
-- BACKFILL: Check badges for all existing users
-- ============================================================================

-- Run check_and_unlock_badges for all existing profiles
DO $$
DECLARE
  v_profile RECORD;
  v_result RECORD;
BEGIN
  FOR v_profile IN SELECT id, first_name, last_name FROM profiles
  LOOP
    -- Check and unlock badges for this user
    SELECT * INTO v_result FROM check_and_unlock_badges(v_profile.id);

    IF v_result.newly_unlocked_count > 0 THEN
      RAISE NOTICE 'User % % unlocked % new badges',
        v_profile.first_name,
        v_profile.last_name,
        v_result.newly_unlocked_count;
    END IF;
  END LOOP;

  RAISE NOTICE 'Backfill complete - badges checked for all users';
END $$;
