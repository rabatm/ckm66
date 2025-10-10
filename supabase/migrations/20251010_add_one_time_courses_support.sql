-- =====================================================
-- ADD ONE-TIME COURSES SUPPORT
-- =====================================================
-- Adds support for standalone one-time courses (events, workshops)
-- These courses don't have a parent course and store their own metadata
-- =====================================================

-- =====================================================
-- PART 1: MODIFY COURSE_INSTANCES TABLE
-- =====================================================

-- Make course_id nullable (for one-time courses)
ALTER TABLE course_instances
  ALTER COLUMN course_id DROP NOT NULL;

-- Add one-time course fields
ALTER TABLE course_instances
  ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS one_time_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS one_time_description TEXT,
  ADD COLUMN IF NOT EXISTS one_time_max_participants INTEGER;

-- Add constraint: one-time courses must have title and max_participants
ALTER TABLE course_instances
  ADD CONSTRAINT check_one_time_fields
  CHECK (
    (is_one_time = false AND course_id IS NOT NULL) OR
    (is_one_time = true AND one_time_title IS NOT NULL AND one_time_max_participants IS NOT NULL)
  );

-- Update existing exceptional instances to be one-time courses
UPDATE course_instances
SET is_one_time = true
WHERE is_exceptional = true;

-- Add index for one-time courses
CREATE INDEX IF NOT EXISTS idx_course_instances_one_time ON course_instances(is_one_time) WHERE is_one_time = true;

-- =====================================================
-- PART 2: UPDATE UNIQUE CONSTRAINT
-- =====================================================

-- Drop old unique constraint
ALTER TABLE course_instances
  DROP CONSTRAINT IF EXISTS course_instances_course_id_instance_date_key;

-- Add new unique constraint that allows NULL course_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_instances_unique
  ON course_instances(course_id, instance_date)
  WHERE course_id IS NOT NULL;

-- =====================================================
-- PART 3: UPDATE RLS POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view scheduled course instances" ON course_instances;

-- Create new policy that includes one-time courses
CREATE POLICY "Users can view all scheduled instances"
  ON course_instances
  FOR SELECT
  USING (status = 'scheduled');

-- =====================================================
-- PART 4: UPDATE HELPER FUNCTIONS
-- =====================================================

-- Update generate_course_instances to skip one-time instances
CREATE OR REPLACE FUNCTION generate_course_instances(
  p_course_id UUID,
  p_weeks_ahead INT DEFAULT 4
)
RETURNS INT AS $$
DECLARE
  v_course RECORD;
  v_recurrence JSONB;
  v_days INT[];
  v_day INT;
  v_current_date DATE;
  v_end_date DATE;
  v_instances_created INT := 0;
BEGIN
  -- Get course details
  SELECT * INTO v_course
  FROM courses
  WHERE id = p_course_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found or inactive';
  END IF;

  -- Parse recurrence pattern
  v_recurrence := v_course.recurrence_pattern;

  IF v_recurrence IS NULL THEN
    RAISE EXCEPTION 'Course has no recurrence pattern';
  END IF;

  -- Extract days array
  SELECT ARRAY(SELECT jsonb_array_elements_text(v_recurrence->'days')::INT)
  INTO v_days;

  -- Set date range
  v_current_date := COALESCE(v_course.recurrence_start, CURRENT_DATE);
  v_end_date := LEAST(
    COALESCE(v_course.recurrence_end, v_current_date + (p_weeks_ahead * 7)),
    v_current_date + (p_weeks_ahead * 7)
  );

  -- Loop through dates
  WHILE v_current_date <= v_end_date LOOP
    -- Check if current day is in recurrence pattern
    IF EXTRACT(DOW FROM v_current_date)::INT = ANY(v_days) THEN
      -- Insert instance if not exists (only for regular courses, not one-time)
      INSERT INTO course_instances (
        course_id,
        instance_date,
        start_time,
        end_time,
        duration_minutes,
        max_capacity,
        instructor_id,
        backup_instructor_id,
        location,
        status,
        is_one_time
      )
      VALUES (
        p_course_id,
        v_current_date,
        v_course.start_time,
        v_course.end_time,
        v_course.duration_minutes,
        v_course.max_capacity,
        v_course.instructor_id,
        v_course.backup_instructor_id,
        v_course.location,
        'scheduled',
        false  -- Regular course instance, not one-time
      )
      ON CONFLICT (course_id, instance_date) WHERE course_id IS NOT NULL DO NOTHING;

      IF FOUND THEN
        v_instances_created := v_instances_created + 1;
      END IF;
    END IF;

    v_current_date := v_current_date + 1;
  END LOOP;

  RETURN v_instances_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 5: ADD HELPER FUNCTION TO CREATE ONE-TIME COURSE
-- =====================================================

CREATE OR REPLACE FUNCTION create_one_time_course_instance(
  p_title VARCHAR(255),
  p_description TEXT,
  p_scheduled_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_max_participants INT,
  p_instructor_id UUID,
  p_location TEXT,
  p_duration_minutes INT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_instance_id UUID;
  v_duration INT;
BEGIN
  -- Calculate duration if not provided
  IF p_duration_minutes IS NULL THEN
    v_duration := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
  ELSE
    v_duration := p_duration_minutes;
  END IF;

  -- Insert one-time course instance
  INSERT INTO course_instances (
    course_id,
    is_one_time,
    one_time_title,
    one_time_description,
    one_time_max_participants,
    instance_date,
    start_time,
    end_time,
    duration_minutes,
    max_capacity,
    instructor_id,
    location,
    status
  )
  VALUES (
    NULL,  -- No parent course
    true,
    p_title,
    p_description,
    p_max_participants,
    p_scheduled_date,
    p_start_time,
    p_end_time,
    v_duration,
    p_max_participants,  -- Use one_time_max_participants as max_capacity
    p_instructor_id,
    p_location,
    'scheduled'
  )
  RETURNING id INTO v_instance_id;

  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 6: GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_one_time_course_instance(VARCHAR, TEXT, DATE, TIME, TIME, INT, UUID, TEXT, INT) TO authenticated;

-- =====================================================
-- PART 7: COMMENTS
-- =====================================================

COMMENT ON COLUMN course_instances.is_one_time IS 'True for one-time courses (workshops, events) that don''t have a parent course';
COMMENT ON COLUMN course_instances.one_time_title IS 'Title for one-time courses (NULL for regular course instances)';
COMMENT ON COLUMN course_instances.one_time_description IS 'Description for one-time courses (NULL for regular course instances)';
COMMENT ON COLUMN course_instances.one_time_max_participants IS 'Max participants for one-time courses (NULL for regular course instances)';
COMMENT ON FUNCTION create_one_time_course_instance IS 'Creates a standalone one-time course instance (workshop, event, etc.)';
