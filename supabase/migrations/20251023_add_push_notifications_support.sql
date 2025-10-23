-- Migration: Add push notifications support
-- Description: Adds expo_push_token column to profiles and creates messages/read_receipts tables
-- Date: 2025-10-23

-- =====================================================
-- 1. ADD EXPO_PUSH_TOKEN TO PROFILES
-- =====================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

COMMENT ON COLUMN profiles.expo_push_token IS 'Expo Push Token for sending push notifications to mobile app';

-- Create index for efficient lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;


-- =====================================================
-- 2. CREATE MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_admin_id ON messages(admin_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

COMMENT ON TABLE messages IS 'Admin messages to be sent to all members';
COMMENT ON COLUMN messages.admin_id IS 'ID of the admin who sent the message';
COMMENT ON COLUMN messages.is_system IS 'Whether this is a system-generated message';


-- =====================================================
-- 3. CREATE MESSAGE_READ_RECEIPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX idx_message_read_receipts_read_at ON message_read_receipts(read_at) WHERE read_at IS NOT NULL;

COMMENT ON TABLE message_read_receipts IS 'Tracks which users have received and read messages';
COMMENT ON COLUMN message_read_receipts.received_at IS 'When the message was received on the device';
COMMENT ON COLUMN message_read_receipts.read_at IS 'When the user opened/read the message';


-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin can view all messages (they created them)
CREATE POLICY "Admin can view own messages" ON messages
  FOR SELECT USING (admin_id = auth.uid());

-- Admin can insert messages
CREATE POLICY "Admin can insert messages" ON messages
  FOR INSERT WITH CHECK (admin_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Enable RLS on message_read_receipts table
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Users can view their own read receipts
CREATE POLICY "Users can view own read receipts" ON message_read_receipts
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own read receipts
CREATE POLICY "Users can insert own read receipts" ON message_read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all read receipts
CREATE POLICY "Admin can view all read receipts" ON message_read_receipts
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
