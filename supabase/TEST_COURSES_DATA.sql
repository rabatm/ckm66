-- ============================================================================
-- TEST DATA: Create sample courses and instances for testing
-- ============================================================================
-- Run this in Supabase SQL Editor to create test data

-- 1. Create a test instructor profile (if not exists)
INSERT INTO profiles (id, first_name, last_name, email, role)
VALUES (
  'test-instructor-id',
  'Jean',
  'Dupont',
  'jean.dupont@test.com',
  'instructor'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create a test regular course
INSERT INTO courses (
  id,
  title,
  description,
  course_type,
  day_of_week,
  start_time,
  end_time,
  max_capacity,
  instructor_id,
  location,
  is_active,
  is_recurring,
  recurrence_pattern,
  recurrence_start
) VALUES (
  'test-course-1',
  'Krav Maga Adultes',
  'Cours de Krav Maga niveau débutant à avancé',
  'regular',
  1, -- Monday
  '19:00:00',
  '20:30:00',
  25,
  'test-instructor-id',
  'Dojo Principal',
  true,
  true,
  '{"days": [1], "frequency": "weekly"}'::jsonb,
  CURRENT_DATE
) ON CONFLICT (id) DO NOTHING;

-- 3. Generate instances for the next 2 weeks
SELECT generate_course_instances('test-course-1', 2);

-- 4. Create a one-time course instance
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
) VALUES (
  NULL, -- No parent course
  true,
  'Stage intensif - Techniques de défense',
  'Stage de 3h pour perfectionner les techniques de défense contre couteau et bâton',
  15,
  CURRENT_DATE + INTERVAL '7 days', -- Next week
  '14:00:00',
  '17:00:00',
  180,
  15,
  'test-instructor-id',
  'Dojo Principal',
  'scheduled'
) ON CONFLICT DO NOTHING;

-- 5. Verify the data
SELECT
  'Courses' as type,
  COUNT(*) as count
FROM courses
WHERE is_active = true
UNION ALL
SELECT
  'Course Instances' as type,
  COUNT(*) as count
FROM course_instances
WHERE status = 'scheduled'
  AND instance_date >= CURRENT_DATE;

-- 6. Show upcoming instances
SELECT
  ci.id,
  ci.instance_date,
  ci.start_time,
  ci.end_time,
  ci.is_one_time,
  CASE
    WHEN ci.is_one_time THEN ci.one_time_title
    ELSE c.title
  END as title,
  CASE
    WHEN ci.is_one_time THEN ci.one_time_description
    ELSE c.description
  END as description,
  p.first_name || ' ' || p.last_name as instructor,
  ci.location,
  ci.max_capacity - ci.current_reservations as available_spots
FROM course_instances ci
LEFT JOIN courses c ON ci.course_id = c.id
LEFT JOIN profiles p ON ci.instructor_id = p.id
WHERE ci.status = 'scheduled'
  AND ci.instance_date >= CURRENT_DATE
  AND ci.instance_date <= CURRENT_DATE + INTERVAL '14 days'
ORDER BY ci.instance_date, ci.start_time;