-- =====================================================
-- FIX COURSES TIME COLUMNS
-- =====================================================
-- Change start_time and end_time from TIMESTAMPTZ to TIME
-- =====================================================

-- Change column types
ALTER TABLE courses
  ALTER COLUMN start_time TYPE TIME USING start_time::TIME,
  ALTER COLUMN end_time TYPE TIME USING end_time::TIME;

-- Add duration_minutes if not exists
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS duration_minutes INT;

-- Update duration_minutes for existing rows
UPDATE courses
SET duration_minutes = EXTRACT(EPOCH FROM (end_time::TIME - start_time::TIME)) / 60
WHERE duration_minutes IS NULL;

-- Add NOT NULL constraint after populating values
ALTER TABLE courses
  ALTER COLUMN duration_minutes SET NOT NULL;

COMMENT ON COLUMN courses.start_time IS 'Start time of the course (time only, without date)';
COMMENT ON COLUMN courses.end_time IS 'End time of the course (time only, without date)';
COMMENT ON COLUMN courses.duration_minutes IS 'Duration of the course in minutes';
