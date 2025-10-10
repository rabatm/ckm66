-- =====================================================
-- BOOKING SYSTEM - Complete Setup (v2)
-- =====================================================
-- This migration sets up the complete booking system
-- Handles existing policies gracefully
-- =====================================================

-- =====================================================
-- PART 1: RLS POLICIES (DROP IF EXISTS)
-- =====================================================

-- Enable RLS on courses and reservations
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view active courses" ON courses;
DROP POLICY IF EXISTS "Instructors can view their courses" ON courses;
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;

-- Courses Policies
CREATE POLICY "Users can view active courses"
  ON courses
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Instructors can view their courses"
  ON courses
  FOR SELECT
  USING (auth.uid() = instructor_id OR auth.uid() = backup_instructor_id);

-- Reservations Policies
CREATE POLICY "Users can view own reservations"
  ON reservations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PART 2: HELPER FUNCTIONS (CREATE OR REPLACE)
-- =====================================================

-- Function: Decrement subscription sessions
CREATE OR REPLACE FUNCTION decrement_subscription_sessions(subscription_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    remaining_sessions = GREATEST(remaining_sessions - 1, 0),
    updated_at = NOW()
  WHERE id = subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Refund subscription sessions
CREATE OR REPLACE FUNCTION refund_subscription_sessions(
  subscription_id UUID,
  amount INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET
    remaining_sessions = remaining_sessions + amount,
    updated_at = NOW()
  WHERE id = subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment course reservations
CREATE OR REPLACE FUNCTION increment_course_reservations(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET
    current_reservations = current_reservations + 1,
    updated_at = NOW()
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Decrement course reservations
CREATE OR REPLACE FUNCTION decrement_course_reservations(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET
    current_reservations = GREATEST(current_reservations - 1, 0),
    updated_at = NOW()
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: WAITING LIST MANAGEMENT
-- =====================================================

-- Function: Update waiting list positions after a cancellation
CREATE OR REPLACE FUNCTION update_waiting_list_positions(course_id UUID)
RETURNS void AS $$
DECLARE
  r RECORD;
  pos INTEGER := 1;
BEGIN
  -- Reorder all waiting list positions sequentially
  FOR r IN
    SELECT id
    FROM reservations
    WHERE reservations.course_id = update_waiting_list_positions.course_id
      AND status = 'waiting_list'
    ORDER BY waiting_list_position, created_at
  LOOP
    UPDATE reservations
    SET
      waiting_list_position = pos,
      updated_at = NOW()
    WHERE id = r.id;

    pos := pos + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 4: INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_day_of_week ON courses(day_of_week) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_courses_location ON courses(location) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_course_id ON reservations(course_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_waiting_list ON reservations(course_id, status, waiting_list_position)
  WHERE status = 'waiting_list';

-- =====================================================
-- PART 5: GRANTS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION decrement_subscription_sessions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_subscription_sessions(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_course_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_course_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_waiting_list_positions(UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION decrement_subscription_sessions IS 'Decrements remaining sessions for a subscription by 1';
COMMENT ON FUNCTION refund_subscription_sessions IS 'Refunds sessions back to a subscription';
COMMENT ON FUNCTION increment_course_reservations IS 'Increments the current_reservations count for a course';
COMMENT ON FUNCTION decrement_course_reservations IS 'Decrements the current_reservations count for a course';
COMMENT ON FUNCTION update_waiting_list_positions IS 'Reorders waiting list positions sequentially after changes';
