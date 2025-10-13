-- Migration: Fix calculate_level function to accept BIGINT
-- Description: SUM() returns BIGINT, not INTEGER
-- Date: 2025-10-03

-- Drop the old function
DROP FUNCTION IF EXISTS calculate_level(INTEGER);

-- Recreate with BIGINT parameter
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

COMMENT ON FUNCTION calculate_level IS 'Calculates user level (1-7) based on total points - accepts BIGINT from SUM()';
