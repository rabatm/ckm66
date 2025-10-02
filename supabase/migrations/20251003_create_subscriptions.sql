-- Migration: Create Subscriptions System
-- Description: Adds subscriptions table for managing user memberships
-- Date: 2025-10-03

-- ============================================================================
-- 1. CREATE SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Subscription details
  type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'quarterly', 'annual', 'session_pack')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),

  -- Dates
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  valid_until DATE, -- For backward compatibility

  -- Session tracking (for session_pack type)
  remaining_sessions INTEGER,
  initial_sessions INTEGER, -- Store initial count for percentage calculation

  -- Payment
  price DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded')),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (end_date > start_date),
  CHECK (remaining_sessions IS NULL OR remaining_sessions >= 0),
  CHECK (price IS NULL OR price >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- 2. TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- ============================================================================
-- 3. FUNCTION TO AUTO-EXPIRE SUBSCRIPTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER := 0;
BEGIN
  -- Mark subscriptions as expired if end_date has passed
  UPDATE subscriptions
  SET
    status = 'expired',
    is_active = false
  WHERE
    end_date < CURRENT_DATE
    AND status = 'active'
    AND is_active = true;

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FUNCTION TO CHECK SUBSCRIPTION VALIDITY
-- ============================================================================

CREATE OR REPLACE FUNCTION is_subscription_valid(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_valid_subscription BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM subscriptions
    WHERE user_id = p_user_id
      AND is_active = true
      AND status = 'active'
      AND end_date >= CURRENT_DATE
      AND (remaining_sessions IS NULL OR remaining_sessions > 0)
  ) INTO v_has_valid_subscription;

  RETURN v_has_valid_subscription;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. FUNCTION TO DECREMENT SESSION COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_session_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_id UUID;
  v_remaining INTEGER;
BEGIN
  -- Get active session pack subscription
  SELECT id, remaining_sessions
  INTO v_subscription_id, v_remaining
  FROM subscriptions
  WHERE user_id = p_user_id
    AND type = 'session_pack'
    AND is_active = true
    AND status = 'active'
    AND remaining_sessions > 0
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no valid session pack found, return false
  IF v_subscription_id IS NULL THEN
    RETURN false;
  END IF;

  -- Decrement remaining sessions
  UPDATE subscriptions
  SET remaining_sessions = remaining_sessions - 1
  WHERE id = v_subscription_id;

  -- If no sessions left, mark as expired
  IF v_remaining - 1 = 0 THEN
    UPDATE subscriptions
    SET status = 'expired', is_active = false
    WHERE id = v_subscription_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Instructors and admins can view all subscriptions
CREATE POLICY "Instructors can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('instructor', 'admin')
    )
  );

-- Only admins and instructors can create subscriptions
CREATE POLICY "Admins and instructors can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('instructor', 'admin')
    )
  );

-- Only admins and instructors can update subscriptions
CREATE POLICY "Admins and instructors can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role IN ('instructor', 'admin')
    )
  );

-- Only admins can delete subscriptions
CREATE POLICY "Only admins can delete subscriptions"
  ON subscriptions FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE role = 'admin'
    )
  );

-- ============================================================================
-- 7. HELPER VIEW FOR ACTIVE SUBSCRIPTIONS
-- ============================================================================

CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
  s.*,
  p.first_name,
  p.last_name,
  p.email,
  EXTRACT(DAY FROM (s.end_date - CURRENT_DATE)) as days_remaining,
  CASE
    WHEN s.initial_sessions IS NOT NULL AND s.initial_sessions > 0
    THEN ROUND((s.remaining_sessions::DECIMAL / s.initial_sessions::DECIMAL) * 100, 2)
    ELSE NULL
  END as sessions_percentage
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.is_active = true
  AND s.status = 'active'
  AND s.end_date >= CURRENT_DATE;

-- ============================================================================
-- 8. SEED DATA (Examples - Optional)
-- ============================================================================

-- Example subscriptions for testing (uncomment to use)
--
-- INSERT INTO subscriptions (user_id, type, start_date, end_date, price, payment_status, initial_sessions, remaining_sessions)
-- VALUES
-- -- Monthly unlimited subscription
-- (
--   (SELECT id FROM profiles WHERE email = 'student@example.com' LIMIT 1),
--   'monthly',
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '1 month',
--   50.00,
--   'paid',
--   NULL,
--   NULL
-- ),
-- -- Session pack subscription
-- (
--   (SELECT id FROM profiles WHERE email = 'student2@example.com' LIMIT 1),
--   'session_pack',
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '3 months',
--   80.00,
--   'paid',
--   10,
--   10
-- );

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE subscriptions IS 'User subscriptions and membership management';
COMMENT ON COLUMN subscriptions.type IS 'Subscription type: monthly, quarterly, annual, or session_pack';
COMMENT ON COLUMN subscriptions.status IS 'Current status: active, expired, cancelled, suspended';
COMMENT ON COLUMN subscriptions.remaining_sessions IS 'For session_pack type: number of sessions remaining';
COMMENT ON COLUMN subscriptions.initial_sessions IS 'For session_pack type: initial number of sessions purchased';
COMMENT ON FUNCTION auto_expire_subscriptions IS 'Automatically mark subscriptions as expired if end_date has passed';
COMMENT ON FUNCTION is_subscription_valid IS 'Check if a user has a valid active subscription';
COMMENT ON FUNCTION decrement_session_count IS 'Decrement session count when user attends a class (for session_pack type)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Run auto-expire on existing data
SELECT auto_expire_subscriptions();
