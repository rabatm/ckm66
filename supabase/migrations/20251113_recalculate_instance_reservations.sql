-- =====================================================
-- FIX: RECALCULATE INSTANCE RESERVATIONS COUNT
-- =====================================================
-- This migration fixes the current_reservations count which may be out of sync
-- with the actual number of confirmed reservations in the database

-- =====================================================
-- PART 1: CREATE FUNCTION TO RECALCULATE COUNTS
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_instance_reservations(instance_id UUID)
RETURNS void AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count only CONFIRMED reservations for this instance
  SELECT COUNT(*)
  INTO v_count
  FROM reservations
  WHERE course_instance_id = instance_id
    AND status = 'confirmed';

  -- Update the instance with the correct count
  UPDATE course_instances
  SET
    current_reservations = v_count,
    updated_at = NOW()
  WHERE id = instance_id;

  RAISE NOTICE 'Updated instance % with confirmed reservations count: %', instance_id, v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 2: RECALCULATE ALL INSTANCES
-- =====================================================

DO $$
DECLARE
  v_instance RECORD;
  v_updated_count INT := 0;
BEGIN
  RAISE NOTICE 'Starting to recalculate all instance reservation counts...';

  FOR v_instance IN
    SELECT id FROM course_instances WHERE status = 'scheduled'
  LOOP
    SELECT recalculate_instance_reservations(v_instance.id);
    v_updated_count := v_updated_count + 1;
  END LOOP;

  RAISE NOTICE 'Successfully recalculated % instances', v_updated_count;
END $$;

-- =====================================================
-- PART 3: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION recalculate_instance_reservations(UUID) TO authenticated;

-- =====================================================
-- COMMENT
-- =====================================================

COMMENT ON FUNCTION recalculate_instance_reservations IS 'Recalculates the current_reservations count for an instance based on actual confirmed reservations in the database';
