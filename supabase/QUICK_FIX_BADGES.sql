-- ============================================================================
-- QUICK FIX: Débloquer les badges pour tous les utilisateurs existants
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase Dashboard
-- pour débloquer immédiatement les badges pour tous les utilisateurs

-- 1. Vérifier l'état actuel
SELECT
  'État actuel' as info,
  (SELECT COUNT(*) FROM profiles) as total_utilisateurs,
  (SELECT COUNT(*) FROM badges WHERE is_system = true) as total_badges_systeme,
  (SELECT COUNT(DISTINCT user_id) FROM user_badges) as utilisateurs_avec_badges,
  (SELECT COUNT(*) FROM user_badges) as total_badges_debloques;

-- 2. Débloquer les badges pour TOUS les utilisateurs
DO $$
DECLARE
  v_profile RECORD;
  v_result RECORD;
  v_total_unlocked INTEGER := 0;
BEGIN
  RAISE NOTICE '=== Début du déblocage des badges ===';

  FOR v_profile IN SELECT id, first_name, last_name, email FROM profiles
  LOOP
    -- Appeler la fonction check_and_unlock_badges pour chaque utilisateur
    SELECT * INTO v_result FROM check_and_unlock_badges(v_profile.id);

    IF v_result.newly_unlocked_count > 0 THEN
      v_total_unlocked := v_total_unlocked + v_result.newly_unlocked_count;
      RAISE NOTICE 'Utilisateur: % % (%) - % nouveaux badges débloqués',
        v_profile.first_name,
        v_profile.last_name,
        v_profile.email,
        v_result.newly_unlocked_count;

      -- Afficher les badges débloqués
      RAISE NOTICE 'Badges: %', v_result.newly_unlocked_badges;
    ELSE
      RAISE NOTICE 'Utilisateur: % % - Aucun nouveau badge',
        v_profile.first_name,
        v_profile.last_name;
    END IF;
  END LOOP;

  RAISE NOTICE '=== Fin du déblocage ===';
  RAISE NOTICE 'Total de badges débloqués: %', v_total_unlocked;
END $$;

-- 3. Afficher le résumé par utilisateur
SELECT
  p.first_name || ' ' || p.last_name as utilisateur,
  p.email,
  p.total_points as points,
  p.current_level as niveau,
  COUNT(ub.id) as badges_debloques,
  COALESCE(
    (SELECT string_agg(b.icon_emoji || ' ' || b.name, ', ')
     FROM user_badges ub2
     JOIN badges b ON b.id = ub2.badge_id
     WHERE ub2.user_id = p.id
     ORDER BY ub2.unlocked_at DESC
     LIMIT 5),
    'Aucun badge'
  ) as derniers_badges
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
GROUP BY p.id, p.first_name, p.last_name, p.email, p.total_points, p.current_level
ORDER BY p.total_points DESC;

-- 4. Statistiques globales
SELECT
  'Statistiques finales' as info,
  COUNT(DISTINCT p.id) as total_utilisateurs,
  COUNT(ub.id) as total_badges_debloques,
  ROUND(AVG(p.total_points), 2) as points_moyens,
  MAX(p.total_points) as max_points,
  MIN(p.total_points) as min_points
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id;
