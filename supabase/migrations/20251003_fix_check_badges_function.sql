-- Migration: Fix check_and_unlock_badges function to handle boolean values
-- Description: Fix the "invalid input syntax for type integer: true" error
-- Date: 2025-10-03

-- ============================================================================
-- RECREATE check_and_unlock_badges WITH FIX
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS TABLE(
  newly_unlocked_count INTEGER,
  newly_unlocked_badges JSONB
) AS $$
DECLARE
  v_profile RECORD;
  v_badge RECORD;
  v_newly_unlocked JSONB := '[]'::JSONB;
  v_count INTEGER := 0;
  v_membership_months INTEGER;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  -- If no profile exists, return early
  IF v_profile IS NULL THEN
    RETURN QUERY SELECT 0, '[]'::JSONB;
    RETURN;
  END IF;

  -- Calculate membership months
  v_membership_months := EXTRACT(MONTH FROM AGE(NOW(), v_profile.join_date));

  -- Loop through all automatic badges
  FOR v_badge IN
    SELECT * FROM badges
    WHERE type = 'automatic'
    AND is_active = true
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
  LOOP
    -- Check if requirements are met
    IF v_badge.requirement_rule IS NOT NULL THEN
      DECLARE
        v_rule_type TEXT := v_badge.requirement_rule->>'type';
        v_unlock BOOLEAN := false;
      BEGIN
        CASE v_rule_type
          -- Numeric comparisons
          WHEN 'total_classes' THEN
            v_unlock := v_profile.total_classes >= (v_badge.requirement_rule->>'value')::INTEGER;
          WHEN 'current_streak' THEN
            v_unlock := v_profile.current_streak >= (v_badge.requirement_rule->>'value')::INTEGER;
          WHEN 'membership_months' THEN
            v_unlock := v_membership_months >= (v_badge.requirement_rule->>'value')::INTEGER;

          -- Boolean check for profile completeness
          WHEN 'profile_complete' THEN
            v_unlock := (
              v_profile.first_name IS NOT NULL AND
              v_profile.first_name != '' AND
              v_profile.last_name IS NOT NULL AND
              v_profile.last_name != '' AND
              v_profile.email IS NOT NULL AND
              v_profile.email != ''
            );

          -- Other rule types
          WHEN 'monthly_attendance' THEN
            -- TODO: implement when attendance tracking is ready
            v_unlock := false;
          WHEN 'quarterly_attendance' THEN
            -- TODO: implement when attendance tracking is ready
            v_unlock := false;
          WHEN 'on_time_count' THEN
            -- TODO: implement when attendance tracking is ready
            v_unlock := false;
          WHEN 'early_arrivals' THEN
            -- TODO: implement when attendance tracking is ready
            v_unlock := false;
          WHEN 'timely_cancellations' THEN
            -- TODO: implement when attendance tracking is ready
            v_unlock := false;
          WHEN 'no_late_cancel_months' THEN
            -- TODO: implement when attendance tracking is ready
            v_unlock := false;

          ELSE
            -- Unknown rule type
            v_unlock := false;
        END CASE;

        -- Unlock badge if requirements met
        IF v_unlock THEN
          INSERT INTO user_badges (user_id, badge_id, awarded_by)
          VALUES (p_user_id, v_badge.id, NULL);

          v_count := v_count + 1;
          v_newly_unlocked := v_newly_unlocked || jsonb_build_object(
            'badge_id', v_badge.id,
            'code', v_badge.code,
            'name', v_badge.name,
            'icon_emoji', v_badge.icon_emoji,
            'points', v_badge.points
          );
        END IF;
      END;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_count, v_newly_unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TEST: Run check for all users immediately
-- ============================================================================

DO $$
DECLARE
  v_profile RECORD;
  v_result RECORD;
BEGIN
  RAISE NOTICE '=== Testing badge unlock for all users ===';

  FOR v_profile IN SELECT id, first_name, last_name FROM profiles
  LOOP
    SELECT * INTO v_result FROM check_and_unlock_badges(v_profile.id);

    IF v_result.newly_unlocked_count > 0 THEN
      RAISE NOTICE 'User % % unlocked % new badges',
        v_profile.first_name,
        v_profile.last_name,
        v_result.newly_unlocked_count;
    END IF;
  END LOOP;

  RAISE NOTICE '=== Test complete ===';
END $$;
