-- =====================================================
-- AUTO-UPDATE RESERVATION COUNT TRIGGER
-- =====================================================
-- This trigger automatically updates current_reservations
-- whenever a reservation is created, updated, or deleted
-- by counting confirmed reservations in the database

-- =====================================================
-- PART 1: Create trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION update_instance_reservations_count()
RETURNS TRIGGER AS $$
DECLARE
  v_confirmed_count INT;
  v_instance_id UUID;
BEGIN
  -- Determine which instance to update
  IF TG_OP = 'DELETE' THEN
    v_instance_id := OLD.course_instance_id;
  ELSE
    v_instance_id := NEW.course_instance_id;
  END IF;

  -- Count all confirmed reservations for this instance
  SELECT COUNT(*)
  INTO v_confirmed_count
  FROM reservations
  WHERE course_instance_id = v_instance_id
    AND status = 'confirmed';

  -- Update the instance with the correct count
  UPDATE course_instances
  SET
    current_reservations = v_confirmed_count,
    updated_at = NOW()
  WHERE id = v_instance_id;

  -- Log the update (optional, comment out if too verbose)
  RAISE NOTICE 'Updated instance % current_reservations to %',
    v_instance_id, v_confirmed_count;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 2: Create triggers on reservations table
-- =====================================================

-- Trigger on INSERT
CREATE TRIGGER trigger_reservation_created
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_instance_reservations_count();

-- Trigger on UPDATE (when status changes)
CREATE TRIGGER trigger_reservation_updated
  AFTER UPDATE ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.course_instance_id IS DISTINCT FROM NEW.course_instance_id)
  EXECUTE FUNCTION update_instance_reservations_count();

-- Trigger on DELETE
CREATE TRIGGER trigger_reservation_deleted
  AFTER DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_instance_reservations_count();

-- =====================================================
-- PART 3: Fix existing data
-- =====================================================

-- Recalculate all instance reservation counts based on actual confirmed reservations
UPDATE course_instances ci
SET current_reservations = (
  SELECT COUNT(*)
  FROM reservations r
  WHERE r.course_instance_id = ci.id
    AND r.status = 'confirmed'
),
updated_at = NOW()
WHERE status = 'scheduled';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION update_instance_reservations_count IS
'Trigger function that automatically updates course_instance.current_reservations
by counting confirmed reservations. Called when reservations are inserted, updated, or deleted.';

COMMENT ON TRIGGER trigger_reservation_created ON reservations IS
'Automatically updates instance reservation count when a new reservation is created.';

COMMENT ON TRIGGER trigger_reservation_updated ON reservations IS
'Automatically updates instance reservation count when a reservation status changes.';

COMMENT ON TRIGGER trigger_reservation_deleted ON reservations IS
'Automatically updates instance reservation count when a reservation is deleted.';
