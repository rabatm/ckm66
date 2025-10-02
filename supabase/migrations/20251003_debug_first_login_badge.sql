-- Migration: Debug First Login Badge
-- Description: Check if first_login badge exists and is awarded correctly
-- Date: 2025-10-03

-- Check if badge exists
DO $$
DECLARE
  v_badge_exists BOOLEAN;
  v_badge_id UUID;
  v_user_count INTEGER;
  v_badge_count INTEGER;
BEGIN
  -- Check badge existence
  SELECT EXISTS(SELECT 1 FROM badges WHERE code = 'first_login') INTO v_badge_exists;

  IF v_badge_exists THEN
    SELECT id INTO v_badge_id FROM badges WHERE code = 'first_login';
    RAISE NOTICE 'Badge "first_login" exists with ID: %', v_badge_id;

    -- Show badge details
    SELECT points INTO v_badge_count FROM badges WHERE code = 'first_login';
    RAISE NOTICE 'Badge points: %', v_badge_count;

    -- Count users with complete profiles
    SELECT COUNT(*) INTO v_user_count
    FROM profiles
    WHERE first_name IS NOT NULL AND first_name != ''
      AND last_name IS NOT NULL AND last_name != ''
      AND email IS NOT NULL;
    RAISE NOTICE 'Users with complete profiles: %', v_user_count;

    -- Count users who have the badge
    SELECT COUNT(*) INTO v_badge_count
    FROM user_badges ub
    WHERE ub.badge_id = v_badge_id;
    RAISE NOTICE 'Users who have the badge: %', v_badge_count;

    -- Show profiles without the badge
    RAISE NOTICE 'Profiles without first_login badge:';
    FOR v_user_count IN
      SELECT p.id, p.first_name, p.last_name, p.email, p.total_points
      FROM profiles p
      WHERE p.first_name IS NOT NULL AND p.first_name != ''
        AND p.last_name IS NOT NULL AND p.last_name != ''
        AND p.email IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM user_badges ub
          WHERE ub.user_id = p.id AND ub.badge_id = v_badge_id
        )
      LIMIT 5
    LOOP
      -- Just for loop to show data
    END LOOP;

  ELSE
    RAISE NOTICE 'Badge "first_login" does NOT exist - need to create it';
  END IF;
END $$;

-- Force grant the badge to all eligible users (those with complete profiles)
INSERT INTO user_badges (user_id, badge_id, awarded_by)
SELECT
  p.id,
  b.id,
  NULL
FROM profiles p
CROSS JOIN badges b
WHERE b.code = 'first_login'
  AND p.first_name IS NOT NULL AND p.first_name != ''
  AND p.last_name IS NOT NULL AND p.last_name != ''
  AND p.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = p.id AND ub.badge_id = b.id
  )
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Show the result
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.total_points,
  p.current_level,
  COUNT(ub.id) as badge_count
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
WHERE p.first_name IS NOT NULL AND p.first_name != ''
GROUP BY p.id, p.first_name, p.last_name, p.total_points, p.current_level
ORDER BY p.created_at DESC
LIMIT 5;
