# Fix pour le système de badges

## Problèmes identifiés

### 1. Fonction jamais appelée ❌
Le système de badges ne fonctionnait pas car la fonction `check_and_unlock_badges()` n'était **jamais appelée** automatiquement. Résultat : les utilisateurs ne recevaient aucun badge même après connexion.

### 2. Erreur de type dans la fonction ❌
```
Error: invalid input syntax for type integer: "true"
```
La fonction `check_and_unlock_badges()` essayait de convertir la valeur booléenne `"true"` en INTEGER, ce qui causait une erreur pour le badge "Communicant".

## Solutions appliquées

### 1. ✅ Fix côté client (FAIT)
- Ajout d'un appel à `checkAndUnlockBadges()` lors de la connexion dans `useAuth.ts`
- Cette solution fonctionne immédiatement mais nécessite que l'utilisateur se connecte

### 2. ✅ Fix de la fonction SQL (FAIT)
- Créé `supabase/FIX_NOW.sql` - Script de correction immédiat
- Créé `supabase/migrations/20251003_fix_check_badges_function.sql` - Migration permanente
- Corrige l'erreur de conversion de type pour les badges booléens

### 3. 🔧 Fix côté base de données - Triggers (À FAIRE)
- Créé `supabase/migrations/20251003_auto_check_badges.sql`
- Ajoute un trigger qui appelle automatiquement `check_and_unlock_badges()` quand un profil est créé ou modifié

## 🚀 CORRECTION IMMÉDIATE - SUIVEZ CES ÉTAPES

### Étape 1 : Corriger la fonction SQL (OBLIGATOIRE)

**Si vous avez l'erreur `invalid input syntax for type integer: "true"`** :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. **SQL Editor** → New query
4. Copiez-collez **tout le contenu** du fichier `supabase/FIX_NOW.sql`
5. **Exécutez** ▶️
6. Vérifiez les résultats dans l'output (vous devriez voir vos badges et points)

### Étape 2 : Tester dans l'application

1. **Déconnectez-vous** de l'application mobile
2. **Reconnectez-vous**
3. ✨ Vos badges devraient apparaître !

Vous devriez obtenir :
- 📱 **Première Connexion** (10 pts)
- ✅ **Communicant** (10 pts si profil complet avec téléphone)

**Total attendu : 10-20 points (Niveau 1 - Débutant)**

## Vérification

Après avoir appliqué le fix, vous pouvez vérifier dans le Dashboard Supabase :

### 1. Vérifier les badges créés

```sql
-- Voir tous les badges système
SELECT code, name, type, category, points
FROM badges
WHERE is_system = true
ORDER BY category, display_order;
```

### 2. Vérifier VOS badges débloqués

```sql
-- Voir vos badges (remplacez YOUR_EMAIL par votre email)
SELECT
  p.first_name || ' ' || p.last_name as nom,
  p.email,
  p.total_points as points,
  p.current_level as niveau,
  COUNT(ub.id) as nombre_badges,
  string_agg(b.icon_emoji || ' ' || b.name, ', ') as badges
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
LEFT JOIN badges b ON b.id = ub.badge_id
WHERE p.email = 'YOUR_EMAIL'
GROUP BY p.id, p.first_name, p.last_name, p.email, p.total_points, p.current_level;
```

### 3. Voir les détails de vos badges

```sql
-- Liste détaillée de vos badges (remplacez YOUR_EMAIL)
SELECT
  b.icon_emoji,
  b.name,
  b.description,
  b.points,
  b.category,
  ub.unlocked_at
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
JOIN profiles p ON p.id = ub.user_id
WHERE p.email = 'YOUR_EMAIL'
ORDER BY ub.unlocked_at DESC;
```

## Pour plus tard : Appliquer les triggers automatiques

Une fois que tout fonctionne, pour avoir les badges automatiquement vérifiés :

1. Allez sur https://supabase.com/dashboard
2. **SQL Editor** → New query
3. Copiez-collez le contenu de `supabase/migrations/20251003_auto_check_badges.sql`
4. Exécutez
5. ✅ Les badges seront désormais vérifiés automatiquement pour tous les changements

## Badges automatiques qui devraient se débloquer

À la première connexion avec un profil complet, vous devriez obtenir :

### Badges de base
- **📱 Première Connexion** (10 pts) - Badge immédiat à la création du profil
- **✅ Communicant** (10 pts) - Si vous avez renseigné nom, prénom, email ET téléphone

### Prochains badges débloquables

#### Badges d'assiduité (basés sur total_classes)
- 🎯 **Première Fois** - 1 cours (10 pts)
- 🔥 **Motivé** - 5 cours (10 pts)
- 💪 **Engagé** - 10 cours (10 pts)
- 🏅 **Assidu** - 25 cours (25 pts)
- ⭐ **Fidèle** - 50 cours (25 pts)
- 💯 **Centurion** - 100 cours (50 pts)
- 🏆 **Légende** - 250 cours (100 pts)
- 👑 **Maître** - 500 cours (100 pts)

#### Badges de longévité (basés sur join_date)
- 🗓️ **3 Mois** - 3 mois d'ancienneté (25 pts)
- 📆 **6 Mois** - 6 mois d'ancienneté (25 pts)
- 🎂 **1 An** - 1 an d'ancienneté (50 pts)
- 🎉 **2 Ans** - 2 ans d'ancienneté (50 pts)
- 💎 **Vétéran** - 3+ ans d'ancienneté (100 pts)

#### Badges de série (basés sur current_streak)
- 🔥 **Série de 5** - 5 cours consécutifs (25 pts)
- 💥 **Série de 10** - 10 cours consécutifs (50 pts)

*Note: Les badges de présence, ponctualité et discipline nécessitent le système de gestion des cours qui n'est pas encore implémenté.*

## Fichiers créés

1. ✅ `supabase/FIX_NOW.sql` - **UTILISEZ CELUI-CI EN PREMIER** - Correction immédiate
2. ✅ `supabase/migrations/20251003_fix_check_badges_function.sql` - Migration de la fonction corrigée
3. ✅ `supabase/migrations/20251003_auto_check_badges.sql` - Migration avec triggers automatiques
4. ✅ `supabase/QUICK_FIX_BADGES.sql` - Script de diagnostic et déblocage manuel
5. ✅ Modification de `src/features/auth/hooks/useAuth.ts` - Appel automatique à la connexion

## Résumé des actions

### ✅ À faire MAINTENANT
1. Exécutez `supabase/FIX_NOW.sql` dans le Dashboard Supabase
2. Déconnectez-vous puis reconnectez-vous dans l'app
3. Vérifiez que vos badges et points apparaissent

### 🔧 Optionnel (pour plus tard)
1. Exécutez `supabase/migrations/20251003_auto_check_badges.sql` pour les triggers automatiques

## Besoin d'aide ?

Si vous avez toujours des problèmes :
1. Vérifiez les logs dans le SQL Editor du Dashboard Supabase
2. Regardez la console du navigateur pour les erreurs
3. Exécutez `supabase/QUICK_FIX_BADGES.sql` pour voir l'état actuel
