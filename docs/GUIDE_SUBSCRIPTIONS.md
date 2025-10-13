
# 🎫 Guide du Système d'Abonnements

## 📋 Vue d'ensemble

Le système d'abonnements permet de gérer les adhésions des membres avec :
- ✅ 4 types d'abonnements
- ✅ Suivi des paiements
- ✅ Alertes d'expiration
- ✅ Gestion des packs de séances
- ✅ Décrémention automatique des séances

---

## 🚀 Installation (3 étapes)

### Étape 1 : Créer la table en DB

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet CKM66
3. **SQL Editor** → New query
4. Copiez **tout le contenu** de `supabase/APPLY_SUBSCRIPTIONS.sql`
5. **Exécutez** ▶️

✅ **Résultat attendu** : "Subscriptions table created"

### Étape 2 : Créer un abonnement de test

1. Dans le **SQL Editor**, nouvelle query
2. Copiez le contenu de `supabase/TEST_SUBSCRIPTIONS.sql`
3. **IMPORTANT** : Remplacez `'votre@email.com'` par votre vrai email (ligne 15)
4. **Exécutez** ▶️

✅ **Résultat** : Vous devriez voir votre abonnement créé

### Étape 3 : Tester dans l'app

1. Ouvrez l'application mobile
2. Allez sur l'onglet **👤 Profil**
3. Scrollez jusqu'à la section **Abonnement**

✅ **Vous devriez voir** :
- Type : Mensuel
- Date d'expiration
- Statut : Actif (badge vert)
- Barre de progression (si pack de séances)

---

## 📊 Types d'abonnements

### 1. Monthly (Mensuel) - Illimité

```sql
INSERT INTO subscriptions (user_id, type, start_date, end_date, price, payment_status)
VALUES (
  'USER_ID',
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 month',
  50.00,
  'paid'
);
```

**Utilisation** : Accès illimité pendant 1 mois

### 2. Quarterly (Trimestriel) - Illimité

```sql
INSERT INTO subscriptions (user_id, type, start_date, end_date, price, payment_status)
VALUES (
  'USER_ID',
  'quarterly',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '3 months',
  120.00,
  'paid'
);
```

**Utilisation** : Accès illimité pendant 3 mois

### 3. Annual (Annuel) - Illimité

```sql
INSERT INTO subscriptions (user_id, type, start_date, end_date, price, payment_status)
VALUES (
  'USER_ID',
  'annual',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  450.00,
  'paid'
);
```

**Utilisation** : Accès illimité pendant 1 an

### 4. Session Pack (Pack de séances) - Limité

```sql
INSERT INTO subscriptions (
  user_id, type, start_date, end_date, price, payment_status,
  initial_sessions, remaining_sessions
)
VALUES (
  'USER_ID',
  'session_pack',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '3 months',
  80.00,
  'paid',
  10,  -- Nombre initial de séances
  10   -- Séances restantes
);
```

**Utilisation** : 10 séances à utiliser en 3 mois

---

## 🎨 Statuts d'affichage

L'application affiche automatiquement :

### ✅ Actif (Vert)
- Plus de 7 jours restants
- Badge : "Actif"
- Couleur : #10B981

### ⚠️ Expire bientôt (Orange)
- 7 jours ou moins restants
- Badge : "Expire bientôt"
- Couleur : #F59E0B
- Alerte affichée avec nombre de jours

### ❌ Expiré (Rouge)
- Date dépassée
- Badge : "Expiré"
- Couleur : #EF4444

### 📋 Aucun abonnement (Gris)
- Pas d'abonnement actif
- Message : "Contactez votre instructeur"

---

## 🔧 Fonctions SQL utiles

### Vérifier si un utilisateur a un abonnement valide

```sql
SELECT is_subscription_valid('USER_ID');
```

**Retourne** : `true` ou `false`

### Décrémenter une séance (pour pack)

```sql
SELECT decrement_session_count('USER_ID');
```

**Effet** :
- Décrémente `remaining_sessions` de 1
- Si `remaining_sessions = 0`, marque l'abonnement comme expiré

### Expirer automatiquement les anciens abonnements

```sql
SELECT auto_expire_subscriptions();
```

**Retourne** : Nombre d'abonnements expirés

---

## 📱 Affichage dans l'application

### Dans ProfileScreen

```
┌─────────────────────────────────┐
│  ABONNEMENT                     │
│  ┌─────────────────────────────┐│
│  │ [Actif] Mensuel             ││
│  │                             ││
│  │ 📅 Expire le 03/11/2025     ││
│  │ 🎫 Séances restantes: 7     ││
│  │ ████████░░ 70%              ││
│  │                             ││
│  │ ⚠️ Expire dans 5 jours      ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### Couleurs de la bordure
- Bordure gauche colorée selon le statut
- Barre de progression pour les packs

---

## 👨‍💼 Gestion par l'instructeur/admin

### Créer un abonnement pour un élève

```sql
-- Par email
INSERT INTO subscriptions (user_id, type, start_date, end_date, price, payment_status)
VALUES (
  (SELECT id FROM profiles WHERE email = 'eleve@email.com'),
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 month',
  50.00,
  'paid'
);

-- Par nom
INSERT INTO subscriptions (user_id, type, start_date, end_date, price, payment_status)
VALUES (
  (SELECT id FROM profiles WHERE first_name = 'Jean' AND last_name = 'Dupont'),
  'quarterly',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '3 months',
  120.00,
  'pending'
);
```

### Voir tous les abonnements actifs

```sql
SELECT * FROM active_subscriptions
ORDER BY days_remaining ASC;
```

### Voir les abonnements qui expirent bientôt

```sql
SELECT
  first_name || ' ' || last_name as nom,
  email,
  type,
  end_date,
  days_remaining
FROM active_subscriptions
WHERE days_remaining <= 7
ORDER BY days_remaining ASC;
```

### Prolonger un abonnement

```sql
UPDATE subscriptions
SET end_date = end_date + INTERVAL '1 month'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'eleve@email.com')
  AND is_active = true;
```

### Ajouter des séances à un pack

```sql
UPDATE subscriptions
SET
  remaining_sessions = remaining_sessions + 5,
  initial_sessions = initial_sessions + 5,
  status = 'active',
  is_active = true
WHERE user_id = (SELECT id FROM profiles WHERE email = 'eleve@email.com')
  AND type = 'session_pack';
```

---

## 🔍 Requêtes de diagnostic

### Voir tous vos abonnements (pour un utilisateur)

```sql
SELECT
  type,
  status,
  start_date,
  end_date,
  remaining_sessions,
  payment_status,
  EXTRACT(DAY FROM (end_date - CURRENT_DATE)) as jours_restants
FROM subscriptions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre@email.com')
ORDER BY created_at DESC;
```

### Statistiques globales

```sql
SELECT
  COUNT(*) as total_abonnements,
  COUNT(*) FILTER (WHERE is_active = true) as actifs,
  COUNT(*) FILTER (WHERE status = 'expired') as expires,
  COUNT(*) FILTER (WHERE type = 'session_pack') as packs,
  SUM(price) FILTER (WHERE payment_status = 'paid') as revenus_payes
FROM subscriptions;
```

### Abonnements par type

```sql
SELECT
  type,
  COUNT(*) as nombre,
  COUNT(*) FILTER (WHERE is_active = true) as actifs,
  AVG(price) as prix_moyen
FROM subscriptions
GROUP BY type
ORDER BY nombre DESC;
```

---

## ⚙️ Configuration avancée

### Changer la durée d'alerte (par défaut 7 jours)

Modifier dans `subscription.service.ts:62` :

```typescript
if (daysRemaining <= 7) return 'expiring'  // Changer 7 par la valeur souhaitée
```

### Personnaliser les tarifs par défaut

Les tarifs ne sont pas hardcodés. Vous pouvez :
1. Ajouter une table `subscription_prices`
2. Gérer les tarifs par période/type
3. Historiser les changements de prix

### Ajouter un type d'abonnement

1. Modifier l'enum dans la migration :
```sql
CHECK (type IN ('monthly', 'quarterly', 'annual', 'session_pack', 'NOUVEAU_TYPE'))
```

2. Ajouter dans `profile.types.ts` :
```typescript
export type SubscriptionType = 'monthly' | 'quarterly' | 'annual' | 'session_pack' | 'nouveau_type'
```

3. Ajouter le label :
```typescript
export const SUBSCRIPTION_TYPE_LABELS = {
  // ...
  nouveau_type: 'Nouveau Type',
}
```

---

## 🐛 Dépannage

### L'abonnement n'apparaît pas dans l'app

1. Vérifiez que l'abonnement existe :
```sql
SELECT * FROM subscriptions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre@email.com');
```

2. Vérifiez que `is_active = true` et `status = 'active'`

3. Vérifiez que `end_date >= CURRENT_DATE`

4. Déconnectez-vous et reconnectez-vous

### Erreur de permission

Vérifiez les RLS policies :
```sql
SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
```

### Les séances ne se décrémentent pas

La fonction `decrement_session_count()` doit être appelée manuellement ou via un trigger lors de la présence à un cours (à implémenter avec le système de cours).

---

## 📝 Prochaines fonctionnalités

- [ ] Interface admin pour créer/gérer les abonnements
- [ ] Historique des paiements
- [ ] Renouvellement automatique
- [ ] Notifications d'expiration
- [ ] Statistiques de revenus
- [ ] Export des abonnements
- [ ] Intégration paiement en ligne

---

## 🎉 Résumé

✅ **La table `subscriptions` est maintenant créée**
✅ **Le code UI est déjà en place et fonctionnel**
✅ **Les fonctions SQL sont prêtes**
✅ **Les RLS policies sont configurées**

**Pour tester** :
1. Exécutez `APPLY_SUBSCRIPTIONS.sql`
2. Créez un abonnement de test avec `TEST_SUBSCRIPTIONS.sql`
3. Ouvrez l'app et allez sur Profil
4. Votre abonnement devrait s'afficher ! 🎊
