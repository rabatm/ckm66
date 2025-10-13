-- =====================================================
-- COMPLETE DATABASE MIGRATION - Fix All Schema Issues
-- =====================================================
-- This script fixes all the database schema issues causing the app errors
-- Run this ENTIRE script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: UPDATE PROFILES TABLE
-- =====================================================

-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_classes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attendance_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Remove old free trial columns (replaced by new system)
ALTER TABLE profiles
DROP COLUMN IF EXISTS free_trials_remaining,
DROP COLUMN IF EXISTS free_trials_granted,
DROP COLUMN IF EXISTS free_trial_granted_by,
DROP COLUMN IF EXISTS free_trial_granted_at;

-- Rename avatar_url to profile_picture_url if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles RENAME COLUMN avatar_url TO profile_picture_url;
  END IF;
END $$;

-- =====================================================
-- PART 2: UPDATE RESERVATIONS TABLE
-- =====================================================

-- Add course_id column to reservations (for compatibility with app code)
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id);

-- Update course_id based on course_instance relationship
UPDATE reservations
SET course_id = ci.course_id
FROM course_instances ci
WHERE reservations.course_instance_id = ci.id
AND reservations.course_id IS NULL;

-- =====================================================
-- PART 3: UPDATE COURSES TABLE
-- =====================================================

-- Add missing columns to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS backup_instructor_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS current_reservations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_age INTEGER,
ADD COLUMN IF NOT EXISTS min_age INTEGER,
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS recurrence_end DATE,
ADD COLUMN IF NOT EXISTS required_equipment TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
ADD COLUMN IF NOT EXISTS recurrence_start DATE;

-- =====================================================
-- PART 4: UPDATE COURSE_INSTANCES TABLE
-- =====================================================

-- Add missing columns to course_instances table
ALTER TABLE course_instances
ADD COLUMN IF NOT EXISTS backup_instructor_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS current_reservations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_exceptional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_one_time BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS one_time_description TEXT,
ADD COLUMN IF NOT EXISTS one_time_max_participants INTEGER,
ADD COLUMN IF NOT EXISTS one_time_title VARCHAR(255);

-- =====================================================
-- PART 5: UPDATE SUBSCRIPTIONS TABLE
-- =====================================================

-- Add missing column to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS valid_until DATE;

-- =====================================================
-- PART 6: CREATE MISSING TABLES
-- =====================================================

-- Create attendance table if it doesn't exist
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  course_instance_id UUID REFERENCES course_instances(id),
  attendance_date DATE,
  attended BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  reminder_24h BOOLEAN DEFAULT true,
  reminder_2h BOOLEAN DEFAULT true,
  cancellation_notifications BOOLEAN DEFAULT true,
  promotion_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  reservation_id UUID REFERENCES reservations(id),
  type TEXT NOT NULL CHECK (type IN ('reminder_24h', 'reminder_2h', 'cancellation', 'confirmation', 'promotion')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push', 'sms')),
  message_content TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 7: CREATE MISSING FUNCTIONS
-- =====================================================

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF points >= 3601 THEN RETURN 7; -- Légende
  ELSIF points >= 2401 THEN RETURN 6; -- Maître
  ELSIF points >= 1501 THEN RETURN 5; -- Expert
  ELSIF points >= 901 THEN RETURN 4; -- Confirmé
  ELSIF points >= 451 THEN RETURN 3; -- Pratiquant
  ELSIF points >= 151 THEN RETURN 2; -- Apprenti
  ELSE RETURN 1; -- Débutant
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check and unlock badges
CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS TABLE(newly_unlocked_count INTEGER, newly_unlocked_badges JSONB) AS $$
DECLARE
  v_profile RECORD;
  v_badge RECORD;
  v_newly_unlocked JSONB := '[]'::JSONB;
  v_count INTEGER := 0;
  v_membership_months INTEGER;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF v_profile IS NULL THEN
    RETURN QUERY SELECT 0, '[]'::JSONB;
    RETURN;
  END IF;

  v_membership_months := EXTRACT(MONTH FROM AGE(NOW(), v_profile.join_date));

  FOR v_badge IN
    SELECT * FROM badges
    WHERE type = 'automatic'
    AND is_active = true
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
  LOOP
    IF v_badge.requirement_rule IS NOT NULL THEN
      DECLARE
        v_rule_type TEXT := v_badge.requirement_rule->>'type';
        v_unlock BOOLEAN := false;
      BEGIN
        CASE v_rule_type
          WHEN 'total_classes' THEN
            v_unlock := v_profile.total_classes >= (v_badge.requirement_rule->>'value')::INTEGER;
          WHEN 'current_streak' THEN
            v_unlock := v_profile.current_streak >= (v_badge.requirement_rule->>'value')::INTEGER;
          WHEN 'membership_months' THEN
            v_unlock := v_membership_months >= (v_badge.requirement_rule->>'value')::INTEGER;
          WHEN 'profile_complete' THEN
            v_unlock := (
              v_profile.first_name IS NOT NULL AND v_profile.first_name != '' AND
              v_profile.last_name IS NOT NULL AND v_profile.last_name != '' AND
              v_profile.email IS NOT NULL AND v_profile.email != ''
            );
          ELSE
            v_unlock := false;
        END CASE;

        IF v_unlock THEN
          INSERT INTO user_badges (user_id, badge_id, awarded_by)
          VALUES (p_user_id, v_badge.id, NULL)
          ON CONFLICT (user_id, badge_id) DO NOTHING;

          v_count := v_count + 1;
          v_newly_unlocked := v_newly_unlocked || jsonb_build_object(
            'badge_id', v_badge.id,
            'code', v_badge.code,
            'name', v_badge.name,
            'points', v_badge.points
          );
        END IF;
      END;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_count, v_newly_unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate course instances
CREATE OR REPLACE FUNCTION generate_course_instances(
  p_course_id UUID,
  p_weeks_ahead INT DEFAULT 4
)
RETURNS INT AS $$
DECLARE
  v_course RECORD;
  v_recurrence JSONB;
  v_days INT[];
  v_current_date DATE;
  v_end_date DATE;
  v_instances_created INT := 0;
BEGIN
  SELECT * INTO v_course
  FROM courses
  WHERE id = p_course_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found or inactive';
  END IF;

  v_recurrence := v_course.recurrence_pattern;

  IF v_recurrence IS NULL THEN
    SELECT ARRAY[v_course.day_of_week] INTO v_days;
  ELSE
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_recurrence->'days')::INT)
    INTO v_days;
  END IF;

  v_current_date := COALESCE(v_course.recurrence_start, CURRENT_DATE);
  v_end_date := LEAST(
    COALESCE(v_course.recurrence_end, v_current_date + (p_weeks_ahead * 7)),
    v_current_date + (p_weeks_ahead * 7)
  );

  WHILE v_current_date <= v_end_date LOOP
    IF EXTRACT(DOW FROM v_current_date)::INT = ANY(v_days) THEN
      INSERT INTO course_instances (
        course_id,
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
        p_course_id,
        v_current_date,
        v_course.start_time,
        v_course.end_time,
        v_course.duration_minutes,
        v_course.max_capacity,
        v_course.instructor_id,
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
-- PART 8: UPDATE INDEXES
-- =====================================================

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points);
CREATE INDEX IF NOT EXISTS idx_profiles_current_level ON profiles(current_level);
CREATE INDEX IF NOT EXISTS idx_reservations_course_id ON reservations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instances_is_one_time ON course_instances(is_one_time);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);

-- =====================================================
-- PART 9: UPDATE RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Add policies for attendance
DROP POLICY IF EXISTS "Users can view their own attendance" ON attendance;
CREATE POLICY "Users can view their own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Instructors can view all attendance" ON attendance;
CREATE POLICY "Instructors can view all attendance"
  ON attendance FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin'))
  );

-- Add policies for notification_settings
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id);

-- Add policies for notification_queue
DROP POLICY IF EXISTS "Users can view their own notifications" ON notification_queue;
CREATE POLICY "Users can view their own notifications"
  ON notification_queue FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all notifications" ON notification_queue;
CREATE POLICY "Admins can manage all notifications"
  ON notification_queue FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- =====================================================
-- PART 10: GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION calculate_level(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_unlock_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_course_instances(UUID, INTEGER) TO authenticated;

-- =====================================================
-- PART 11: VERIFICATION
-- =====================================================

-- Verify all required columns exist
SELECT
  'profiles.total_points exists' as check_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_points'
  ) as exists_flag
UNION ALL
SELECT
  'profiles.profile_picture_url exists',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_picture_url'
  )
UNION ALL
SELECT
  'reservations.course_id exists',
  EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'course_id'
  );

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- The database schema should now match what the app expects.
-- Restart your app and the errors should be resolved.
-- =====================================================</content>
<parameter name="filePath">/Users/martincelavie/DEV/martininfo/ckm092025/mobile/FIX_DATABASE_SCHEMA.sql