-- ============================================================================
-- SCRIPT D'APPLICATION RAPIDE - Table Subscriptions
-- ============================================================================
-- Copiez-collez ce script dans le SQL Editor de Supabase Dashboard
-- pour créer la table subscriptions et toutes ses fonctionnalités

-- 1. Créer la table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'quarterly', 'annual', 'session_pack')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  valid_until DATE,
  remaining_sessions INTEGER,
  initial_sessions INTEGER,
  price DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date > start_date),
  CHECK (remaining_sessions IS NULL OR remaining_sessions >= 0),
  CHECK (price IS NULL OR price >= 0)
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id, is_active) WHERE is_active = true;

-- 3. Trigger updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- 4. Fonction auto-expiration
CREATE OR REPLACE FUNCTION auto_expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER := 0;
BEGIN
  UPDATE subscriptions
  SET status = 'expired', is_active = false
  WHERE end_date < CURRENT_DATE AND status = 'active' AND is_active = true;
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Fonction validation abonnement
CREATE OR REPLACE FUNCTION is_subscription_valid(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND is_active = true
      AND status = 'active'
      AND end_date >= CURRENT_DATE
      AND (remaining_sessions IS NULL OR remaining_sessions > 0)
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Fonction décrémenter séances
CREATE OR REPLACE FUNCTION decrement_session_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_id UUID;
  v_remaining INTEGER;
BEGIN
  SELECT id, remaining_sessions INTO v_subscription_id, v_remaining
  FROM subscriptions
  WHERE user_id = p_user_id
    AND type = 'session_pack'
    AND is_active = true
    AND status = 'active'
    AND remaining_sessions > 0
  ORDER BY created_at DESC LIMIT 1;

  IF v_subscription_id IS NULL THEN RETURN false; END IF;

  UPDATE subscriptions SET remaining_sessions = remaining_sessions - 1
  WHERE id = v_subscription_id;

  IF v_remaining - 1 = 0 THEN
    UPDATE subscriptions SET status = 'expired', is_active = false
    WHERE id = v_subscription_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 7. RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Instructors can view all subscriptions" ON subscriptions;
CREATE POLICY "Instructors can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin')));

DROP POLICY IF EXISTS "Admins and instructors can create subscriptions" ON subscriptions;
CREATE POLICY "Admins and instructors can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin')));

DROP POLICY IF EXISTS "Admins and instructors can update subscriptions" ON subscriptions;
CREATE POLICY "Admins and instructors can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin')));

DROP POLICY IF EXISTS "Only admins can delete subscriptions" ON subscriptions;
CREATE POLICY "Only admins can delete subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 8. Vue des abonnements actifs
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
  s.*,
  p.first_name, p.last_name, p.email,
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

-- 9. Expirer les anciens abonnements
SELECT auto_expire_subscriptions();

-- 10. Vérifier que tout fonctionne
SELECT
  'Subscriptions table created' as status,
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions
FROM subscriptions;
