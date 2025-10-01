-- Enable Row Level Security on tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- Courses: All authenticated users can view courses
CREATE POLICY "Courses are viewable by authenticated users"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Admins and instructors can manage courses
CREATE POLICY "Admins and instructors can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Admins and instructors can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- ============================================================================
-- RESERVATIONS POLICIES
-- ============================================================================

-- Reservations: Users can view their own reservations
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own reservations
CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own reservations
CREATE POLICY "Users can update their own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- ATTENDANCE POLICIES
-- ============================================================================

-- Users can view their own attendance
CREATE POLICY "Users can view their own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins and instructors can view all attendance
CREATE POLICY "Admins and instructors can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- Admins and instructors can insert attendance records
CREATE POLICY "Admins and instructors can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- Admins and instructors can update attendance records
CREATE POLICY "Admins and instructors can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- ============================================================================
-- NOTIFICATION SETTINGS POLICIES
-- ============================================================================

-- Users can view their own notification settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own notification settings
CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own notification settings
CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- NOTIFICATION QUEUE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notification_queue FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notification_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert notifications (admins only)
CREATE POLICY "Admins can insert notifications"
  ON notification_queue FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
