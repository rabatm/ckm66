-- Migration: Create Badges System with Levels and Points
-- Description: Adds badges, user_badges tables, extends profiles with points/levels
-- Date: 2025-10-02

-- ============================================================================
-- 1. EXTEND PROFILES TABLE
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_classes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attendance_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- ============================================================================
-- 2. CREATE BADGES TABLE (Catalogue)
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  icon_emoji VARCHAR(10) NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  type VARCHAR(20) NOT NULL CHECK (type IN ('automatic', 'manual')),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'assiduity', 'presence', 'punctuality', 'discipline', 'longevity',
    'technical', 'quality', 'attitude', 'custom'
  )),
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requirement_rule JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_type ON badges(type);
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_is_system ON badges(is_system);
CREATE INDEX idx_badges_is_active ON badges(is_active);

-- ============================================================================
-- 3. CREATE USER_BADGES TABLE (Unlocked badges)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  coach_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_unlocked_at ON user_badges(unlocked_at);

-- ============================================================================
-- 4. FUNCTION TO CALCULATE LEVEL FROM POINTS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_level(points INTEGER)
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

-- ============================================================================
-- 5. TRIGGER TO UPDATE TOTAL_POINTS AND CURRENT_LEVEL
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_points_and_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total points for the user
  UPDATE profiles
  SET
    total_points = (
      SELECT COALESCE(SUM(b.points), 0)
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = NEW.user_id
    ),
    current_level = calculate_level((
      SELECT COALESCE(SUM(b.points), 0)
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = NEW.user_id
    ))
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_points_on_badge_unlock
AFTER INSERT ON user_badges
FOR EACH ROW
EXECUTE FUNCTION update_user_points_and_level();

-- Also update when a badge is removed (just in case)
CREATE TRIGGER trigger_update_points_on_badge_remove
AFTER DELETE ON user_badges
FOR EACH ROW
EXECUTE FUNCTION update_user_points_and_level();

-- ============================================================================
-- 6. SEED DATA - AUTOMATIC BADGES
-- ============================================================================

-- ASSIDUITY BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule) VALUES
('first_class', 'Première Fois', 'Premier cours suivi', '🎯', 10, 'automatic', 'assiduity', 1, '{"type": "total_classes", "operator": ">=", "value": 1}'),
('motivated', 'Motivé', '5 cours suivis', '🔥', 10, 'automatic', 'assiduity', 2, '{"type": "total_classes", "operator": ">=", "value": 5}'),
('engaged', 'Engagé', '10 cours suivis', '💪', 10, 'automatic', 'assiduity', 3, '{"type": "total_classes", "operator": ">=", "value": 10}'),
('regular', 'Assidu', '25 cours suivis', '🏅', 25, 'automatic', 'assiduity', 4, '{"type": "total_classes", "operator": ">=", "value": 25}'),
('loyal', 'Fidèle', '50 cours suivis', '⭐', 25, 'automatic', 'assiduity', 5, '{"type": "total_classes", "operator": ">=", "value": 50}'),
('centurion', 'Centurion', '100 cours suivis', '💯', 50, 'automatic', 'assiduity', 6, '{"type": "total_classes", "operator": ">=", "value": 100}'),
('legend', 'Légende', '250 cours suivis', '🏆', 100, 'automatic', 'assiduity', 7, '{"type": "total_classes", "operator": ">=", "value": 250}'),
('master_attendance', 'Maître', '500 cours suivis', '👑', 100, 'automatic', 'assiduity', 8, '{"type": "total_classes", "operator": ">=", "value": 500}');

-- PRESENCE BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule) VALUES
('perfect_month', 'Sans Faute', 'Présence parfaite pendant 1 mois (100%)', '⚡', 25, 'automatic', 'presence', 10, '{"type": "monthly_attendance", "operator": "=", "value": 100}'),
('streak_5', 'Série de 5', '5 cours consécutifs sans absence', '🔥', 25, 'automatic', 'presence', 11, '{"type": "current_streak", "operator": ">=", "value": 5}'),
('streak_10', 'Série de 10', '10 cours consécutifs sans absence', '💥', 50, 'automatic', 'presence', 12, '{"type": "current_streak", "operator": ">=", "value": 10}'),
('quarterly', 'Trimestriel', 'Présence >80% sur 3 mois', '🌟', 25, 'automatic', 'presence', 13, '{"type": "quarterly_attendance", "operator": ">=", "value": 80}');

-- PUNCTUALITY BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule) VALUES
('on_time', 'Toujours à l''heure', 'Présent à l''heure à 10 cours', '⏰', 25, 'automatic', 'punctuality', 20, '{"type": "on_time_count", "operator": ">=", "value": 10}'),
('early_bird', 'En avance', 'Arrivé 10 min en avance à 5 cours', '🚀', 25, 'automatic', 'punctuality', 21, '{"type": "early_arrivals", "operator": ">=", "value": 5}');

-- DISCIPLINE BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule) VALUES
('good_student', 'Bon élève', 'Annule à temps (24h+) 5 fois', '✅', 25, 'automatic', 'discipline', 30, '{"type": "timely_cancellations", "operator": ">=", "value": 5}'),
('rule_respect', 'Respect des règles', 'Aucune annulation tardive en 3 mois', '🎖️', 25, 'automatic', 'discipline', 31, '{"type": "no_late_cancel_months", "operator": ">=", "value": 3}'),
('communicative', 'Communicant', 'A renseigné toutes les infos du profil', '📧', 10, 'automatic', 'discipline', 32, '{"type": "profile_complete", "operator": "=", "value": true}');

-- LONGEVITY BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule) VALUES
('3_months', '3 Mois', 'Membre depuis 3 mois', '🗓️', 25, 'automatic', 'longevity', 40, '{"type": "membership_months", "operator": ">=", "value": 3}'),
('6_months', '6 Mois', 'Membre depuis 6 mois', '📆', 25, 'automatic', 'longevity', 41, '{"type": "membership_months", "operator": ">=", "value": 6}'),
('1_year', '1 An', 'Membre depuis 1 an', '🎂', 50, 'automatic', 'longevity', 42, '{"type": "membership_months", "operator": ">=", "value": 12}'),
('2_years', '2 Ans', 'Membre depuis 2 ans', '🎉', 50, 'automatic', 'longevity', 43, '{"type": "membership_months", "operator": ">=", "value": 24}'),
('veteran', 'Vétéran', 'Membre depuis 3+ ans', '💎', 100, 'automatic', 'longevity', 44, '{"type": "membership_months", "operator": ">=", "value": 36}');

-- ============================================================================
-- 7. SEED DATA - MANUAL BADGES (COACH)
-- ============================================================================

-- TECHNICAL BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order) VALUES
('basic_techniques', 'Techniques de Base', 'Maîtrise des fondamentaux', '🥋', 30, 'manual', 'technical', 100),
('perfect_strikes', 'Frappes Parfaites', 'Excellentes techniques de frappe', '👊', 50, 'manual', 'technical', 101),
('leg_master', 'Maître des Jambes', 'Techniques de jambes maîtrisées', '🦵', 50, 'manual', 'technical', 102),
('defender', 'Défenseur', 'Excellentes parades et défenses', '🛡️', 50, 'manual', 'technical', 103),
('knife_pro', 'Pro du Couteau', 'Spécialiste défense contre couteau', '🔪', 75, 'manual', 'technical', 104),
('weapon_counter', 'Contre Armes', 'Spécialiste désarmement', '🔫', 75, 'manual', 'technical', 105),
('grappling_expert', 'Saisies & Clés', 'Expert en saisies et projections', '🤼', 50, 'manual', 'technical', 106);

-- QUALITY BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order) VALUES
('quick_learner', 'Esprit Vif', 'Compréhension rapide des techniques', '💡', 50, 'manual', 'quality', 200),
('strategist', 'Stratège', 'Excellente analyse tactique', '🧠', 50, 'manual', 'quality', 201),
('fighter', 'Combattant', 'Excellent en sparring', '⚔️', 75, 'manual', 'quality', 202),
('precision', 'Précision', 'Excellente précision des frappes', '🎯', 50, 'manual', 'quality', 203),
('power', 'Puissance', 'Frappes puissantes et efficaces', '💥', 50, 'manual', 'quality', 204),
('speed', 'Rapidité', 'Vitesse d''exécution exceptionnelle', '🐆', 50, 'manual', 'quality', 205);

-- ATTITUDE BADGES
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order) VALUES
('team_spirit', 'Esprit d''équipe', 'Excellent partenaire d''entraînement', '🤝', 75, 'manual', 'attitude', 300),
('mentor', 'Mentor', 'Aide les nouveaux élèves', '💚', 50, 'manual', 'attitude', 301),
('motivation', 'Motivation', 'Motivation exemplaire', '🌟', 50, 'manual', 'attitude', 302),
('leader', 'Leader', 'Exemple pour les autres', '🎖️', 75, 'manual', 'attitude', 303),
('remarkable_progress', 'Progression Remarquable', 'Progrès exceptionnels', '🏅', 40, 'manual', 'attitude', 304);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badges: Everyone can read
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- Badges: Only instructors can create custom badges
CREATE POLICY "Instructors can create custom badges"
  ON badges FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin'))
  );

-- Badges: Only creator or admin can update/delete
CREATE POLICY "Creators and admins can modify badges"
  ON badges FOR UPDATE
  USING (
    created_by = auth.uid()
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- User Badges: Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (user_id = auth.uid());

-- User Badges: Instructors can view all badges
CREATE POLICY "Instructors can view all user badges"
  ON user_badges FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin'))
  );

-- User Badges: System or instructors can award badges
CREATE POLICY "Instructors can award badges"
  ON user_badges FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('instructor', 'admin'))
  );

-- User Badges: Admins can delete badges
CREATE POLICY "Admins can delete badges"
  ON user_badges FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ============================================================================
-- 9. HELPER FUNCTION TO CHECK AND UNLOCK AUTOMATIC BADGES
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS TABLE(
  newly_unlocked_count INTEGER,
  newly_unlocked_badges JSONB
) AS $$
DECLARE
  v_profile RECORD;
  v_badge RECORD;
  v_newly_unlocked JSONB := '[]'::JSONB;
  v_count INTEGER := 0;
  v_membership_months INTEGER;
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  -- Calculate membership months
  v_membership_months := EXTRACT(MONTH FROM AGE(NOW(), v_profile.join_date));

  -- Loop through all automatic badges
  FOR v_badge IN
    SELECT * FROM badges
    WHERE type = 'automatic'
    AND is_active = true
    AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
  LOOP
    -- Check if requirements are met
    IF v_badge.requirement_rule IS NOT NULL THEN
      DECLARE
        v_rule_type TEXT := v_badge.requirement_rule->>'type';
        v_rule_value INTEGER := (v_badge.requirement_rule->>'value')::INTEGER;
        v_unlock BOOLEAN := false;
      BEGIN
        CASE v_rule_type
          WHEN 'total_classes' THEN
            v_unlock := v_profile.total_classes >= v_rule_value;
          WHEN 'current_streak' THEN
            v_unlock := v_profile.current_streak >= v_rule_value;
          WHEN 'membership_months' THEN
            v_unlock := v_membership_months >= v_rule_value;
          WHEN 'profile_complete' THEN
            v_unlock := (
              v_profile.first_name IS NOT NULL AND
              v_profile.last_name IS NOT NULL AND
              v_profile.email IS NOT NULL AND
              v_profile.phone IS NOT NULL
            );
          ELSE
            v_unlock := false;
        END CASE;

        -- Unlock badge if requirements met
        IF v_unlock THEN
          INSERT INTO user_badges (user_id, badge_id, awarded_by)
          VALUES (p_user_id, v_badge.id, NULL);

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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE badges IS 'Catalogue of all badges (system and custom)';
COMMENT ON TABLE user_badges IS 'Badges unlocked by users';
COMMENT ON FUNCTION calculate_level IS 'Calculates user level (1-7) based on total points';
COMMENT ON FUNCTION update_user_points_and_level IS 'Updates user total_points and current_level when badges are unlocked';
COMMENT ON FUNCTION check_and_unlock_badges IS 'Checks and automatically unlocks badges for a user based on their stats';
