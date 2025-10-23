-- Migration: Add course reminder notifications tracking
-- Description: Track which course reminders have been sent
-- Date: 2025-10-23

-- =====================================================
-- 1. CREATE COURSE_REMINDER_NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS course_reminder_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_instance_id UUID NOT NULL REFERENCES course_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_instance_id, user_id, reminder_time)
);

CREATE INDEX IF NOT EXISTS idx_course_reminder_notifications_instance_id ON course_reminder_notifications(course_instance_id);
CREATE INDEX IF NOT EXISTS idx_course_reminder_notifications_user_id ON course_reminder_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reminder_notifications_sent_at ON course_reminder_notifications(sent_at);

COMMENT ON TABLE course_reminder_notifications IS 'Tracks course reminder notifications sent to users (30 minutes before class)';
COMMENT ON COLUMN course_reminder_notifications.reminder_time IS 'The scheduled reminder time (30 minutes before class start)';
