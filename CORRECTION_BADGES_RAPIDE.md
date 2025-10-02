# 🚨 CORRECTION RAPIDE - Badges qui ne s'affichent pas

## Le problème
Erreur : `invalid input syntax for type integer: "true"`

## ✅ LA SOLUTION EN 3 ÉTAPES

### ÉTAPE 1 : Corriger la base de données (2 minutes)

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet CKM66
3. Cliquez sur **SQL Editor** (menu de gauche)
4. Cliquez sur **New query**
5. Ouvrez le fichier `supabase/FIX_NOW.sql` de votre projet
6. **Copiez TOUT le contenu** du fichier
7. **Collez** dans le SQL Editor
8. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter / Cmd+Enter)
9. ✅ Vérifiez que la requête s'exécute sans erreur

**Résultat attendu :** Vous devriez voir un tableau avec votre nom, vos points et vos badges

### ÉTAPE 2 : Tester l'application

1. Ouvrez votre app mobile
2. **Déconnectez-vous** (bouton "Se déconnecter" dans le profil)
3. **Reconnectez-vous** avec vos identifiants

### ÉTAPE 3 : Vérifier

Dans l'écran Profil, vous devriez maintenant voir :
- ✅ Vos **points** (normalement 10 ou 20 pts)
- ✅ Votre **niveau** (Niveau 1 - Débutant)
- ✅ Vos **badges débloqués**

## 📊 Badges que vous devriez avoir

Au minimum :
- **📱 Première Connexion** - 10 points

Si votre profil est complet (nom + prénom + email + téléphone) :
- **✅ Communicant** - 10 points supplémentaires

**Total attendu : 10 à 20 points → Niveau 1 (Débutant)**

## ❌ Si ça ne marche toujours pas

### Vérification dans Supabase

Exécutez cette requête dans le SQL Editor (remplacez `votre@email.com`) :

```sql
SELECT
  p.first_name || ' ' || p.last_name as nom,
  p.email,
  p.total_points as points,
  p.current_level as niveau,
  COUNT(ub.id) as nombre_badges
FROM profiles p
LEFT JOIN user_badges ub ON ub.user_id = p.id
WHERE p.email = 'votre@email.com'
GROUP BY p.id, p.first_name, p.last_name, p.email, p.total_points, p.current_level;
```

### Vérification dans l'app

Ouvrez la console de l'app (logs) et cherchez :
- Messages d'erreur contenant "badge"
- Messages d'erreur contenant "check_and_unlock"

## 📁 Fichiers importants

- `supabase/FIX_NOW.sql` ← **CELUI À EXÉCUTER EN PREMIER**
- `FIX_BADGES.md` ← Documentation complète
- `src/features/auth/hooks/useAuth.ts` ← Modifié pour appeler les badges à la connexion

## 💡 Prochaines étapes (optionnel)

Une fois que tout fonctionne, vous pouvez installer les triggers automatiques :
- Exécutez `supabase/migrations/20251003_auto_check_badges.sql`
- Les badges seront vérifiés automatiquement à chaque modification du profil

---

**Besoin d'aide ?** Regardez `FIX_BADGES.md` pour plus de détails.
