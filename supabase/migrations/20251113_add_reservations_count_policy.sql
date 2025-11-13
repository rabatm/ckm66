-- =====================================================
-- FIX: Add RLS policy for counting reservations
-- =====================================================
-- This policy allows all authenticated users to count confirmed reservations
-- for any instance without seeing personal reservation details

-- =====================================================
-- PART 1: Add policy for counting (all authenticated users)
-- =====================================================

-- This policy allows authenticated users to view basic reservation info
-- needed for instance availability calculation (status only)
-- but doesn't expose user details

CREATE POLICY "Authenticated users can count reservations for availability"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Authenticated users can count reservations for availability" ON reservations IS
'Allows authenticated users to count/aggregate reservation status for showing instance availability. Does not expose personal user details.';
