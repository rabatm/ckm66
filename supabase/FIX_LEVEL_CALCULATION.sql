-- Fix Level Calculation and Total Points
-- This script recalculates total_points and current_level for all users
-- Run this in Supabase SQL Editor

-- First, ensure the calculate_level function exists with correct signature
CREATE OR REPLACE FUNCTION calculate_level(points BIGINT)
RETURNS INTEGER AS $$
BEGIN
  IF points >= 3601 THEN RETURN 7; -- Légende
  ELSIF points >= 2401 THEN RETURN 6; -- Maître
  ELSIF points >= 1501 THEN RETURN 5; -- Expert
  ELSIF points >= 901 THEN RETURN 4; -- Confirmé
  ELSIF points >= 451 THEN RETURN 3; -- Pratiquant
  ELSIF points >= 151 THEN RETURN 2; -- Apprenti
  ELSE RETURN 1; -- Débutant
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Now check the current state
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.total_points as stored_total_points,
  p.current_level as stored_current_level,
  COALESCE(SUM(b.points), 0) as calculated_total_points,
  calculate_level(COALESCE(SUM(b.points), 0)) as calculated_current_level
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
LEFT JOIN badges b ON b.id = ub.badge_id
GROUP BY p.id, p.first_name, p.last_name, p.total_points, p.current_level
ORDER BY p.id;

-- Update all profiles with correct total_points and current_level
UPDATE profiles
SET
  total_points = calculated_totals.calculated_total_points,
  current_level = calculated_totals.calculated_current_level
FROM (
  SELECT
    p.id,
    COALESCE(SUM(b.points), 0) as calculated_total_points,
    calculate_level(COALESCE(SUM(b.points), 0)) as calculated_current_level
  FROM profiles p
  LEFT JOIN user_badges ub ON ub.user_id = p.id
  LEFT JOIN badges b ON b.id = ub.badge_id
  GROUP BY p.id
) as calculated_totals
WHERE profiles.id = calculated_totals.id;

-- Verify the fix
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.total_points,
  p.current_level,
  CASE p.current_level
    WHEN 1 THEN 'Débutant'
    WHEN 2 THEN 'Apprenti'
    WHEN 3 THEN 'Pratiquant'
    WHEN 4 THEN 'Confirmé'
    WHEN 5 THEN 'Expert'
    WHEN 6 THEN 'Maître'
    WHEN 7 THEN 'Légende'
    ELSE 'Unknown'
  END as level_title
FROM profiles p
ORDER BY p.total_points DESC;