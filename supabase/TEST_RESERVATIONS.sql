-- ============================================================================
-- TEST DATA: Create sample reservations for testing
-- ============================================================================
-- Run this in Supabase SQL Editor to create test reservations

-- 1. Get the user ID (replace with your actual user ID)
-- You can find this in the profiles table or from your auth user

-- 2. Create a test reservation for an upcoming course instance
INSERT INTO reservations (
  user_id,
  course_instance_id,
  subscription_id,
  status,
  reservation_date,
  reserved_at,
  session_deducted,
  sessions_deducted
) VALUES (
  (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1), -- Replace with your email
  (SELECT id FROM course_instances WHERE status = 'scheduled' AND instance_date >= CURRENT_DATE ORDER BY instance_date LIMIT 1),
  (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1) AND status = 'active' LIMIT 1),
  'confirmed',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_TIMESTAMP,
  false,
  0
) ON CONFLICT DO NOTHING;

-- 3. Create a test reservation for a past course instance (for testing past reservations)
INSERT INTO reservations (
  user_id,
  course_instance_id,
  subscription_id,
  status,
  reservation_date,
  reserved_at,
  session_deducted,
  sessions_deducted
) VALUES (
  (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1), -- Replace with your email
  (SELECT id FROM course_instances WHERE status = 'scheduled' AND instance_date < CURRENT_DATE ORDER BY instance_date DESC LIMIT 1),
  (SELECT id FROM subscriptions WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1) AND status = 'active' LIMIT 1),
  'completed',
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_TIMESTAMP,
  false,
  0
) ON CONFLICT DO NOTHING;

-- 4. Verify the reservations
SELECT
  r.id,
  r.status,
  r.reservation_date,
  r.reserved_at,
  CASE
    WHEN ci.is_one_time THEN ci.one_time_title
    ELSE c.title
  END as course_title,
  ci.instance_date,
  ci.start_time,
  ci.end_time,
  p.first_name || ' ' || p.last_name as instructor
FROM reservations r
LEFT JOIN course_instances ci ON r.course_instance_id = ci.id
LEFT JOIN courses c ON ci.course_id = c.id
LEFT JOIN profiles p ON ci.instructor_id = p.id
WHERE r.user_id = (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1)
ORDER BY r.reservation_date DESC;