-- ============================================================================
-- SCRIPT DE TEST - Créer des abonnements de test
-- ============================================================================
-- Exécutez ce script APRÈS avoir créé la table subscriptions
-- pour tester l'affichage dans l'application

-- 1. Créer un abonnement mensuel actif pour vous-même
-- Remplacez 'votre@email.com' par votre email

INSERT INTO subscriptions (
  user_id,
  type,
  start_date,
  end_date,
  price,
  payment_status,
  is_active,
  status
)
VALUES (
  (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1),
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 month',
  50.00,
  'paid',
  true,
  'active'
);

-- 2. Créer un pack de 10 séances (exemple)
-- INSERT INTO subscriptions (
--   user_id,
--   type,
--   start_date,
--   end_date,
--   price,
--   payment_status,
--   initial_sessions,
--   remaining_sessions,
--   is_active,
--   status
-- )
-- VALUES (
--   (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1),
--   'session_pack',
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '3 months',
--   80.00,
--   'paid',
--   10,
--   10,
--   true,
--   'active'
-- );

-- 3. Créer un abonnement qui expire bientôt (pour tester l'alerte)
-- INSERT INTO subscriptions (
--   user_id,
--   type,
--   start_date,
--   end_date,
--   price,
--   payment_status,
--   is_active,
--   status
-- )
-- VALUES (
--   (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1),
--   'quarterly',
--   CURRENT_DATE - INTERVAL '2 months 25 days',
--   CURRENT_DATE + INTERVAL '5 days',
--   120.00,
--   'paid',
--   true,
--   'active'
-- );

-- 4. Vérifier vos abonnements
SELECT
  s.id,
  s.type,
  s.status,
  s.start_date,
  s.end_date,
  s.remaining_sessions,
  s.price,
  s.payment_status,
  EXTRACT(DAY FROM (s.end_date - CURRENT_DATE)) as jours_restants,
  CASE
    WHEN EXTRACT(DAY FROM (s.end_date - CURRENT_DATE)) < 0 THEN 'Expiré'
    WHEN EXTRACT(DAY FROM (s.end_date - CURRENT_DATE)) <= 7 THEN 'Expire bientôt'
    ELSE 'Actif'
  END as alerte
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE p.email = 'votre@email.com'
ORDER BY s.created_at DESC;

-- 5. Tester la fonction de validation
SELECT
  p.first_name || ' ' || p.last_name as nom,
  p.email,
  is_subscription_valid(p.id) as abonnement_valide
FROM profiles p
WHERE p.email = 'votre@email.com';

-- 6. Tester la décrémention de séances (si vous avez un pack)
-- SELECT decrement_session_count(
--   (SELECT id FROM profiles WHERE email = 'votre@email.com' LIMIT 1)
-- );

-- 7. Voir tous vos abonnements via la vue
SELECT * FROM active_subscriptions
WHERE email = 'votre@email.com';
