-- =====================================================
-- COMPLETE SUPABASE SETUP FOR CKM ADMIN
-- =====================================================
-- This script contains ALL SQL needed to set up a fresh Supabase instance
-- Run this ENTIRE script in your Supabase SQL Editor
-- Estimated time: 2-3 minutes
-- =====================================================


-- =====================================================
-- PART 1: CREATE TABLES
-- =====================================================

-- -----------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'instructor', 'secretary', 'member', 'guest')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Gamification system
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_classes INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Free trial system for guests
  free_trials_remaining INTEGER DEFAULT 0,
  free_trials_granted INTEGER DEFAULT 0,
  free_trial_granted_by UUID REFERENCES profiles(id),
  free_trial_granted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN profiles.role IS 'User role: admin, instructor, secretary, member, or guest';
COMMENT ON COLUMN profiles.free_trials_remaining IS 'Number of free trial classes remaining for guest users';


-- -----------------------------------------------------
-- 2. SUBSCRIPTIONS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'quarterly', 'annual', 'session_pack')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',

  -- Session pack specific fields
  initial_sessions INTEGER,
  remaining_sessions INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

COMMENT ON TABLE subscriptions IS 'Member subscriptions and session packs';
COMMENT ON COLUMN subscriptions.initial_sessions IS 'Number of sessions purchased (for session_pack type only)';


-- -----------------------------------------------------
-- 3. BADGES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_emoji TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('assiduity', 'presence', 'punctuality', 'discipline', 'longevity', 'technical', 'quality', 'attitude', 'custom')),
  type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('automatic', 'manual')),
  points INTEGER DEFAULT 0,
  requirement_rule JSONB,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_code ON badges(code);
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_is_active ON badges(is_active);

COMMENT ON TABLE badges IS 'Achievement badges that can be awarded to users';


-- -----------------------------------------------------
-- 4. USER_BADGES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by UUID REFERENCES profiles(id),
  coach_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

COMMENT ON TABLE user_badges IS 'Tracks which badges each user has earned';


-- -----------------------------------------------------
-- 5. COURSES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'all' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
  course_type TEXT NOT NULL DEFAULT 'recurring' CHECK (course_type IN ('recurring', 'one_time')),

  -- Scheduling
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  one_time_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Course details
  max_capacity INTEGER NOT NULL DEFAULT 20,
  current_reservations INTEGER DEFAULT 0,
  location TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  backup_instructor_id UUID REFERENCES profiles(id),
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,

  -- Additional fields
  prerequisites TEXT[],
  required_equipment TEXT[],
  min_age INTEGER,
  max_age INTEGER,
  recurrence_pattern JSONB,
  recurrence_start DATE,
  recurrence_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_by UUID REFERENCES profiles(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_one_time_date CHECK (
    (course_type = 'recurring' AND day_of_week IS NOT NULL AND one_time_date IS NULL)
    OR
    (course_type = 'one_time' AND one_time_date IS NOT NULL)
  )
);

CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_day_of_week ON courses(day_of_week);
CREATE INDEX idx_courses_is_active ON courses(is_active);
CREATE INDEX idx_courses_course_type ON courses(course_type);
CREATE INDEX idx_courses_backup_instructor_id ON courses(backup_instructor_id);

COMMENT ON TABLE courses IS 'Course templates - both recurring weekly courses and one-time events';


-- -----------------------------------------------------
-- 6. COURSE_INSTANCES TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS course_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  backup_instructor_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  location TEXT NOT NULL,
  max_capacity INTEGER NOT NULL,
  current_reservations INTEGER DEFAULT 0,
  notes TEXT,

  -- Additional fields for one-time courses and exceptions
  is_exceptional BOOLEAN DEFAULT false,
  is_one_time BOOLEAN DEFAULT false,
  one_time_title VARCHAR(255),
  one_time_description TEXT,
  one_time_max_participants INTEGER,
  cancellation_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_instances_course_id ON course_instances(course_id);
CREATE INDEX idx_course_instances_instructor_id ON course_instances(instructor_id);
CREATE INDEX idx_course_instances_instance_date ON course_instances(instance_date);
CREATE INDEX idx_course_instances_status ON course_instances(status);
CREATE INDEX idx_course_instances_backup_instructor_id ON course_instances(backup_instructor_id);
CREATE INDEX idx_course_instances_is_one_time ON course_instances(is_one_time);

COMMENT ON TABLE course_instances IS 'Specific scheduled instances of courses';


-- -----------------------------------------------------
-- 7. RESERVATIONS TABLE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_instance_id UUID NOT NULL REFERENCES course_instances(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id), -- For direct course reservations (one-time courses)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show', 'waiting_list')),
  is_free_trial BOOLEAN DEFAULT false,
  notes TEXT,

  -- Additional fields for advanced booking system
  reservation_date DATE,
  reserved_at TIMESTAMP WITH TIME ZONE,
  attended BOOLEAN DEFAULT false,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  promoted_at TIMESTAMP WITH TIME ZONE,
  promoted_from_waiting_at TIMESTAMP WITH TIME ZONE,
  promotion_reason TEXT,
  refund_amount DECIMAL(10,2),
  session_deducted BOOLEAN DEFAULT false,
  sessions_deducted INTEGER DEFAULT 0,
  last_notification_date TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT false,
  waiting_list_position INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(course_instance_id, user_id)
);

CREATE INDEX idx_reservations_course_instance_id ON reservations(course_instance_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_is_free_trial ON reservations(is_free_trial);
CREATE INDEX idx_reservations_course_id ON reservations(course_id);
CREATE INDEX idx_reservations_waiting_list ON reservations(course_instance_id, status, waiting_list_position) WHERE status = 'waiting_list';

COMMENT ON TABLE reservations IS 'Student bookings/reservations for course instances';


-- =====================================================
-- PART 2: ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- -----------------------------------------------------
-- PROFILES RLS
-- -----------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'secretary', 'instructor')
  )
)
WITH CHECK (
  auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "profiles_delete_policy"
ON profiles FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- -----------------------------------------------------
-- SUBSCRIPTIONS RLS
-- -----------------------------------------------------
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow admins/secretaries to insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow admins/secretaries to update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow admins to delete subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;

CREATE POLICY "Allow authenticated users to read subscriptions"
ON subscriptions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow admins/secretaries to insert subscriptions"
ON subscriptions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary')
  )
);

CREATE POLICY "Allow admins/secretaries to update subscriptions"
ON subscriptions FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary')
  )
);

CREATE POLICY "Allow admins to delete subscriptions"
ON subscriptions FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can read own subscriptions"
ON subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid());


-- -----------------------------------------------------
-- BADGES RLS
-- -----------------------------------------------------
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "badges_select_policy" ON badges;
DROP POLICY IF EXISTS "badges_insert_policy" ON badges;
DROP POLICY IF EXISTS "badges_update_policy" ON badges;
DROP POLICY IF EXISTS "badges_delete_policy" ON badges;

CREATE POLICY "badges_select_policy"
ON badges FOR SELECT TO authenticated
USING (
  is_active = true OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor', 'secretary')
  )
);

CREATE POLICY "badges_insert_policy"
ON badges FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "badges_update_policy"
ON badges FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "badges_delete_policy"
ON badges FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- -----------------------------------------------------
-- USER_BADGES RLS
-- -----------------------------------------------------
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_badges_select_policy" ON user_badges;
DROP POLICY IF EXISTS "user_badges_insert_policy" ON user_badges;
DROP POLICY IF EXISTS "user_badges_delete_policy" ON user_badges;

CREATE POLICY "user_badges_select_policy"
ON user_badges FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor', 'secretary')
  )
);

CREATE POLICY "user_badges_insert_policy"
ON user_badges FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor', 'secretary')
  )
);

CREATE POLICY "user_badges_delete_policy"
ON user_badges FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- -----------------------------------------------------
-- COURSES RLS
-- -----------------------------------------------------
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

CREATE POLICY "courses_select_policy"
ON courses FOR SELECT TO authenticated
USING (true);

CREATE POLICY "courses_insert_policy"
ON courses FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "courses_update_policy"
ON courses FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "courses_delete_policy"
ON courses FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- -----------------------------------------------------
-- COURSE_INSTANCES RLS
-- -----------------------------------------------------
ALTER TABLE course_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_instances_select_policy" ON course_instances;
DROP POLICY IF EXISTS "course_instances_insert_policy" ON course_instances;
DROP POLICY IF EXISTS "course_instances_update_policy" ON course_instances;
DROP POLICY IF EXISTS "course_instances_delete_policy" ON course_instances;

CREATE POLICY "course_instances_select_policy"
ON course_instances FOR SELECT TO authenticated
USING (true);

CREATE POLICY "course_instances_insert_policy"
ON course_instances FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "course_instances_update_policy"
ON course_instances FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "course_instances_delete_policy"
ON course_instances FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- -----------------------------------------------------
-- RESERVATIONS RLS
-- -----------------------------------------------------
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_select_policy" ON reservations;
DROP POLICY IF EXISTS "reservations_insert_policy" ON reservations;
DROP POLICY IF EXISTS "reservations_update_policy" ON reservations;
DROP POLICY IF EXISTS "reservations_delete_policy" ON reservations;

CREATE POLICY "reservations_select_policy"
ON reservations FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "reservations_insert_policy"
ON reservations FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "reservations_update_policy"
ON reservations FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
)
WITH CHECK (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);

CREATE POLICY "reservations_delete_policy"
ON reservations FOR DELETE TO authenticated
USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'secretary', 'instructor')
  )
);


-- =====================================================
-- PART 3: FUNCTIONS AND TRIGGERS
-- =====================================================

-- -----------------------------------------------------
-- Auto-update updated_at column
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_badges_updated_at ON badges;
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_instances_updated_at ON course_instances;
CREATE TRIGGER update_course_instances_updated_at BEFORE UPDATE ON course_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- -----------------------------------------------------
-- Free Trial System - Set default for new guests
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_guest_free_trials()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'guest' AND NEW.free_trials_remaining IS NULL THEN
    NEW.free_trials_remaining := 1;
    NEW.free_trials_granted := 1;
    NEW.free_trial_granted_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_guest_free_trials_trigger ON profiles;
CREATE TRIGGER set_guest_free_trials_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_guest_free_trials();


-- -----------------------------------------------------
-- Free Trial System - Grant free trials
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION grant_free_trials(
  p_guest_id UUID,
  p_num_trials INTEGER,
  p_granted_by UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    free_trials_remaining = free_trials_remaining + p_num_trials,
    free_trials_granted = free_trials_granted + p_num_trials,
    free_trial_granted_by = p_granted_by,
    free_trial_granted_at = NOW()
  WHERE id = p_guest_id AND role = 'guest';
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- Free Trial System - Use a free trial
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION use_free_trial(
  p_guest_id UUID,
  p_reservation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  SELECT free_trials_remaining INTO v_remaining
  FROM profiles
  WHERE id = p_guest_id AND role = 'guest';

  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET free_trials_remaining = free_trials_remaining - 1
  WHERE id = p_guest_id;

  UPDATE reservations
  SET is_free_trial = TRUE
  WHERE id = p_reservation_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- Gamification System - Calculate level from points
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_level(points BIGINT)
RETURNS INTEGER AS $$
BEGIN
  IF points >= 1201 THEN RETURN 7; -- Légende
  ELSIF points >= 801 THEN RETURN 6; -- Maître
  ELSIF points >= 501 THEN RETURN 5; -- Expert
  ELSIF points >= 301 THEN RETURN 4; -- Confirmé
  ELSIF points >= 151 THEN RETURN 3; -- Pratiquant
  ELSIF points >= 51 THEN RETURN 2; -- Apprenti
  ELSE RETURN 1; -- Débutant
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- -----------------------------------------------------
-- Badge System - Check and unlock automatic badges
-- -----------------------------------------------------
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


-- -----------------------------------------------------
-- Course Instance Generation
-- -----------------------------------------------------
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


-- -----------------------------------------------------
-- Helper Functions for Reservations
-- -----------------------------------------------------
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
-- PART 4: GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION grant_free_trials(UUID, INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION use_free_trial(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_level(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_unlock_badges(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_course_instances(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_course_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_course_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_instance_reservations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_instance_waiting_list_positions(UUID) TO authenticated;


-- =====================================================
-- PART 5: VERIFICATION
-- =====================================================

-- Verify all tables were created
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;


-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Create your first admin user via Supabase Dashboard (Authentication > Users)
-- 2. Insert the user's profile: INSERT INTO profiles (id, email, role, first_name, last_name) VALUES ('USER_UUID', 'admin@example.com', 'admin', 'Admin', 'User');
-- 3. Configure your .env.local file with Supabase credentials
-- 4. Start your application and log in!
--
-- The database now includes all columns expected by the application:
-- ✅ profiles.total_points, profile_picture_url, current_level, join_date, etc.
-- ✅ reservations.course_id for direct course reservations
-- ✅ courses.current_reservations, backup_instructor_id, etc.
-- ✅ course_instances.current_reservations, is_one_time, etc.
-- ✅ All required functions: calculate_level, check_and_unlock_badges, etc.
-- =====================================================


-- =====================================================
-- OPTIONAL: SAMPLE BADGES DATA
-- =====================================================
-- Uncomment the following section to add sample badge data

/*
-- Sample automatic badges
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule) VALUES
('first_class', 'Première Fois', 'Premier cours suivi', '🎯', 10, 'automatic', 'assiduity', 1, '{"type": "total_classes", "operator": ">=", "value": 1}'),
('motivated', 'Motivé', '5 cours suivis', '🔥', 10, 'automatic', 'assiduity', 2, '{"type": "total_classes", "operator": ">=", "value": 5}'),
('regular', 'Assidu', '25 cours suivis', '🏅', 25, 'automatic', 'assiduity', 4, '{"type": "total_classes", "operator": ">=", "value": 25}'),
('streak_5', 'Série de 5', '5 cours consécutifs', '🔥', 25, 'automatic', 'presence', 11, '{"type": "current_streak", "operator": ">=", "value": 5}'),
('communicative', 'Communicant', 'Profil complet', '📧', 10, 'automatic', 'discipline', 32, '{"type": "profile_complete", "operator": "=", "value": true}');

-- Sample manual badges
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order) VALUES
('basic_techniques', 'Techniques de Base', 'Maîtrise des fondamentaux', '🥋', 30, 'manual', 'technical', 100),
('team_spirit', 'Esprit d''équipe', 'Excellent partenaire', '🤝', 75, 'manual', 'attitude', 300);
*/
