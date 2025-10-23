-- Migration: Add push notifications support (Minimal - only add missing columns)
-- Description: Adds only the missing columns to existing tables
-- Date: 2025-10-23

-- =====================================================
-- 1. ADD EXPO_PUSH_TOKEN TO PROFILES
-- =====================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token ON profiles(expo_push_token) WHERE expo_push_token IS NOT NULL;


-- =====================================================
-- 2. ADD MISSING COLUMNS TO MESSAGES TABLE
-- =====================================================
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_messages_admin_id ON messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);


-- =====================================================
-- 3. ADD MISSING COLUMNS TO MESSAGE_READ_RECEIPTS TABLE
-- =====================================================
ALTER TABLE message_read_receipts
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_read_at ON message_read_receipts(read_at) WHERE read_at IS NOT NULL;


-- =====================================================
-- 4. ENABLE AND SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Drop old policies to recreate them
DROP POLICY IF EXISTS "Admin can view own messages" ON messages;
DROP POLICY IF EXISTS "Admin can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can view own read receipts" ON message_read_receipts;
DROP POLICY IF EXISTS "Users can insert own read receipts" ON message_read_receipts;
DROP POLICY IF EXISTS "Admin can view all read receipts" ON message_read_receipts;

-- Create new policies for messages
CREATE POLICY "messages_admin_select" ON messages
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "messages_admin_insert" ON messages
  FOR INSERT WITH CHECK (
    admin_id = auth.uid() AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create new policies for message_read_receipts
CREATE POLICY "read_receipts_user_select" ON message_read_receipts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "read_receipts_user_insert" ON message_read_receipts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "read_receipts_admin_select" ON message_read_receipts
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
