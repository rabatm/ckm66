-- =====================================================
-- COURSE INSTANCES SYSTEM
-- =====================================================
-- Refactors the booking system to use course instances
-- Each instance = specific date + time for a recurring course
-- Users can book/cancel individual instances independently
-- =====================================================

-- =====================================================
-- PART 1: CREATE COURSE_INSTANCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS course_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Date et horaires spécifiques
  instance_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,

  -- Capacité pour cette instance
  max_capacity INT NOT NULL,
  current_reservations INT DEFAULT 0,

  -- Instructeur pour cette instance (peut être remplacé)
  instructor_id UUID REFERENCES profiles(id),
  backup_instructor_id UUID REFERENCES profiles(id),
  location TEXT NOT NULL,

  -- Statut
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  cancellation_reason TEXT,

  -- Métadonnées
  is_exceptional BOOLEAN DEFAULT false,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contrainte unique : un cours ne peut avoir qu'une instance par date
  UNIQUE(course_id, instance_date)
);

-- Index pour performance
CREATE INDEX idx_course_instances_course_id ON course_instances(course_id);
CREATE INDEX idx_course_instances_date ON course_instances(instance_date) WHERE status = 'scheduled';
CREATE INDEX idx_course_instances_instructor ON course_instances(instructor_id);

-- Enable RLS
ALTER TABLE course_instances ENABLE ROW LEVEL SECURITY;

-- Users can view scheduled instances
CREATE POLICY "Users can view scheduled course instances"
  ON course_instances
  FOR SELECT
  USING (status = 'scheduled');

-- =====================================================
-- PART 2: ADD RECURRENCE TO COURSES TABLE
-- =====================================================

-- Add recurrence pattern to courses
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
  ADD COLUMN IF NOT EXISTS recurrence_start DATE,
  ADD COLUMN IF NOT EXISTS recurrence_end DATE;

-- Update existing courses to have recurrence pattern based on day_of_week
UPDATE courses
SET
  recurrence_pattern = jsonb_build_object(
    'days', jsonb_build_array(day_of_week),
    'frequency', 'weekly'
  ),
  recurrence_start = CURRENT_DATE,
  recurrence_end = NULL
WHERE recurrence_pattern IS NULL AND day_of_week IS NOT NULL;

-- =====================================================
-- PART 3: MODIFY RESERVATIONS TABLE
-- =====================================================

-- Add course_instance_id to reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS course_instance_id UUID REFERENCES course_instances(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_reservations_instance_id ON reservations(course_instance_id);

-- Update RLS policies for reservations with instances
DROP POLICY IF EXISTS "Users can view own reservations with instances" ON reservations;
CREATE POLICY "Users can view own reservations with instances"
  ON reservations
  FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 4: FUNCTION TO GENERATE INSTANCES
-- =====================================================

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
      -- Insert instance if not exists
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
        status
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
        'scheduled'
      )
      ON CONFLICT (course_id, instance_date) DO NOTHING;

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
-- PART 5: FUNCTION TO AUTO-GENERATE FOR ALL COURSES
-- =====================================================

CREATE OR REPLACE FUNCTION generate_all_course_instances(
  p_weeks_ahead INT DEFAULT 4
)
RETURNS TABLE(course_id UUID, instances_created INT) AS $$
DECLARE
  v_course RECORD;
  v_count INT;
BEGIN
  FOR v_course IN
    SELECT id
    FROM courses
    WHERE is_active = true
      AND is_recurring = true
      AND recurrence_pattern IS NOT NULL
  LOOP
    v_count := generate_course_instances(v_course.id, p_weeks_ahead);

    course_id := v_course.id;
    instances_created := v_count;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 6: UPDATE HELPER FUNCTIONS
-- =====================================================

-- Update increment function to work with instances
CREATE OR REPLACE FUNCTION increment_instance_reservations(instance_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_instances
  SET
    current_reservations = current_reservations + 1,
    updated_at = NOW()
  WHERE id = instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update decrement function to work with instances
CREATE OR REPLACE FUNCTION decrement_instance_reservations(instance_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE course_instances
  SET
    current_reservations = GREATEST(current_reservations - 1, 0),
    updated_at = NOW()
  WHERE id = instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update waiting list function to work with instances
CREATE OR REPLACE FUNCTION update_instance_waiting_list_positions(instance_id UUID)
RETURNS void AS $$
DECLARE
  r RECORD;
  pos INTEGER := 1;
BEGIN
  FOR r IN
    SELECT id
    FROM reservations
    WHERE course_instance_id = instance_id
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
-- PART 7: GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION generate_course_instances(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_all_course_instances(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_instance_waiting_list_positions(UUID) TO authenticated;

-- =====================================================
-- PART 8: COMMENTS
-- =====================================================

COMMENT ON TABLE course_instances IS 'Specific dated instances of recurring courses';
COMMENT ON COLUMN course_instances.instance_date IS 'Specific date for this course occurrence';
COMMENT ON COLUMN course_instances.is_exceptional IS 'True for exceptional courses (workshops, makeup classes)';
COMMENT ON FUNCTION generate_course_instances IS 'Generates course instances for the next N weeks';
COMMENT ON FUNCTION generate_all_course_instances IS 'Generates instances for all active recurring courses';
