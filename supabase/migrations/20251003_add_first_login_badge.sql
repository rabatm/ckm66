-- Migration: Add First Login Badge
-- Description: Add badge for first app login/profile creation
-- Date: 2025-10-03

-- Add the first login badge
INSERT INTO badges (code, name, description, icon_emoji, points, type, category, display_order, requirement_rule)
VALUES (
  'first_login',
  'Première Connexion',
  'Bienvenue ! Tu as créé ton profil sur l''app mobile',
  '📱',
  10,
  'automatic',
  'assiduity',
  0,  -- Display first
  '{"type": "profile_complete", "operator": "=", "value": true}'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_emoji = EXCLUDED.icon_emoji,
  points = EXCLUDED.points,
  requirement_rule = EXCLUDED.requirement_rule;

-- Grant the badge to all users who already have complete profiles
INSERT INTO user_badges (user_id, badge_id, awarded_by)
SELECT
  p.id,
  b.id,
  NULL
FROM profiles p
CROSS JOIN badges b
WHERE b.code = 'first_login'
  AND p.first_name IS NOT NULL
  AND p.first_name != ''
  AND p.last_name IS NOT NULL
  AND p.last_name != ''
  AND p.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = p.id AND ub.badge_id = b.id
  );
