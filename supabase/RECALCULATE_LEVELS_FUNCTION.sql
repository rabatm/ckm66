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

  -- Calculate current level with new thresholds
  IF v_total_points >= 3601 THEN v_current_level := 7; -- Légende
  ELSIF v_total_points >= 2401 THEN v_current_level := 6; -- Maître
  ELSIF v_total_points >= 1501 THEN v_current_level := 5; -- Expert
  ELSIF v_total_points >= 901 THEN v_current_level := 4; -- Confirmé
  ELSIF v_total_points >= 451 THEN v_current_level := 3; -- Pratiquant
  ELSIF v_total_points >= 151 THEN v_current_level := 2; -- Apprenti
  ELSE v_current_level := 1; -- Débutant
  END IF;

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
  RAISE NOTICE 'Starting recalculation of all user levels with new thresholds...';

  FOR v_profile IN SELECT id, first_name, last_name FROM profiles
  LOOP
    PERFORM recalculate_user_level(v_profile.id);
  END LOOP;

  RAISE NOTICE 'Recalculation complete.';
END;
$$ LANGUAGE plpgsql;