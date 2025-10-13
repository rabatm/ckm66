-- Function to recalculate level and points for a specific user
CREATE OR REPLACE FUNCTION recalculate_user_level(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_points INTEGER;
  v_current_level INTEGER;
BEGIN
  -- Calculate total points
  SELECT COALESCE(SUM(b.points), 0) INTO v_total_points
  FROM user_badges ub
  JOIN badges b ON b.id = ub.badge_id
  WHERE ub.user_id = p_user_id;

  -- Calculate current level
  v_current_level := calculate_level(v_total_points);

  -- Update profile
  UPDATE profiles
  SET
    total_points = v_total_points,
    current_level = v_current_level
  WHERE id = p_user_id;

  RAISE NOTICE 'User %: total_points=%d, current_level=%d', p_user_id, v_total_points, v_current_level;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate levels for all users
CREATE OR REPLACE FUNCTION recalculate_all_user_levels()
RETURNS VOID AS $$
DECLARE
  v_profile RECORD;
BEGIN
  RAISE NOTICE 'Starting recalculation of all user levels...';

  FOR v_profile IN SELECT id, first_name, last_name FROM profiles
  LOOP
    PERFORM recalculate_user_level(v_profile.id);
  END LOOP;

  RAISE NOTICE 'Recalculation complete.';
END;
$$ LANGUAGE plpgsql;