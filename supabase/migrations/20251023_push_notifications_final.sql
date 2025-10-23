-- Migration: Add push notifications support (Final version)
-- Description: Adds missing columns to existing messages table and sets up notifications
-- Date: 2025-10-23

-- =====================================================
-- 1. ADD EXPO_PUSH_TOKEN TO PROFILES
-- =====================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;

COMMENT ON COLUMN profiles.expo_push_token IS 'Expo Push Token for sending push notifications to mobile app';


-- =====================================================
-- 2. FIX MESSAGES TABLE - Add missing columns one by one
-- =====================================================
-- Add admin_id column if missing
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add title column if missing
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add is_system column if missing
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- Add content column if missing
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS content TEXT;

-- Add created_at column if missing
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column if missing
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_admin_id ON messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

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

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_read_at ON message_read_receipts(read_at) WHERE read_at IS NOT NULL;

COMMENT ON TABLE message_read_receipts IS 'Tracks which users have received and read messages';
COMMENT ON COLUMN message_read_receipts.received_at IS 'When the message was received on the device';
COMMENT ON COLUMN message_read_receipts.read_at IS 'When the user opened/read the message';


-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can view own messages" ON messages;
DROP POLICY IF EXISTS "Admin can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view own read receipts" ON message_read_receipts;
DROP POLICY IF EXISTS "Users can insert own read receipts" ON message_read_receipts;
DROP POLICY IF EXISTS "Admin can view all read receipts" ON message_read_receipts;

-- Messages table policies
CREATE POLICY "Admin can view own messages" ON messages
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admin can insert messages" ON messages
  FOR INSERT WITH CHECK (admin_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Message read receipts policies
CREATE POLICY "Users can view own read receipts" ON message_read_receipts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own read receipts" ON message_read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all read receipts" ON message_read_receipts
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
