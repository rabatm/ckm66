-- Migration: Add notification preferences to profiles
-- Description: Allow users to manage their notification settings
-- Date: 2025-10-23

-- =====================================================
-- ADD NOTIFICATION PREFERENCE COLUMNS TO PROFILES
-- =====================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notify_course_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_messages BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.notify_course_reminders IS 'Whether to receive 30-minute course reminder notifications';
COMMENT ON COLUMN profiles.notify_messages IS 'Whether to receive admin message notifications';
