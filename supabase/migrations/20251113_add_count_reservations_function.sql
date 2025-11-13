-- =====================================================
-- FIX: Add secure function to count confirmed reservations
-- =====================================================
-- This function bypasses RLS to count reservations for an instance
-- Users need to know total confirmed count to see available spots
-- but we don't expose individual reservation details

-- =====================================================
-- PART 1: Create secure counting function
-- =====================================================

CREATE OR REPLACE FUNCTION count_confirmed_reservations(instance_id UUID)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count only CONFIRMED reservations for this instance
  -- This function is SECURITY DEFINER so it bypasses RLS
  SELECT COUNT(*)
  INTO v_count
  FROM reservations
  WHERE course_instance_id = instance_id
    AND status = 'confirmed';

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 2: Create secure function to get instance with count
-- =====================================================

CREATE OR REPLACE FUNCTION get_instance_with_count(instance_id UUID)
RETURNS TABLE (
  id UUID,
  course_id UUID,
  instance_date DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INT,
  max_capacity INT,
  current_reservations INT,
  confirmed_count INT,
  available_spots INT,
  is_full BOOLEAN,
  instructor_id UUID,
  backup_instructor_id UUID,
  location TEXT,
  status TEXT,
  cancellation_reason TEXT,
  is_exceptional BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_confirmed_count INT;
  v_instance RECORD;
BEGIN
  -- Get the instance
  SELECT * INTO v_instance
  FROM course_instances
  WHERE course_instances.id = instance_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Count confirmed reservations
  v_confirmed_count := count_confirmed_reservations(instance_id);

  -- Return instance with calculated fields
  RETURN QUERY
  SELECT
    v_instance.id,
    v_instance.course_id,
    v_instance.instance_date,
    v_instance.start_time,
    v_instance.end_time,
    v_instance.duration_minutes,
    v_instance.max_capacity,
    v_instance.current_reservations,
    v_confirmed_count,
    (v_instance.max_capacity - v_confirmed_count) AS available_spots,
    (v_confirmed_count >= v_instance.max_capacity) AS is_full,
    v_instance.instructor_id,
    v_instance.backup_instructor_id,
    v_instance.location,
    v_instance.status,
    v_instance.cancellation_reason,
    v_instance.is_exceptional,
    v_instance.notes,
    v_instance.created_at,
    v_instance.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: Grant permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION count_confirmed_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_instance_with_count(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION count_confirmed_reservations IS 'Safely counts confirmed reservations for an instance, bypassing RLS so users can see total availability';
COMMENT ON FUNCTION get_instance_with_count IS 'Returns instance details with calculated confirmed reservation count and available spots';
