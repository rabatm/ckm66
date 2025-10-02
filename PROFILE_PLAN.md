# Plan Profil Élève Krav Maga - CKM66 (Simplifié)

## Vue d'ensemble
Créer un profil simple et motivant pour un élève de Krav Maga axé sur l'engagement, l'assiduité et la reconnaissance par badges.

---

## 1. En-tête Profil

### Avatar/Photo
- **Photo de profil** personnalisable (ou initiales par défaut)
- Option pour changer la photo
- Pas de badge de niveau (supprimé)

### Informations Principales
- Nom complet
- Email
- Téléphone
- **Date d'inscription au club** (affichage "Membre depuis X mois")
- **Niveau et Points** (ex: "Niveau 4 - Confirmé • 450/500 pts")
- Statut du compte (actif/inactif)
  
---

## 2. Statistiques d'Entraînement

### Statistiques Générales (Visibles en Cards)
- **Nombre total de cours suivis**
- **Taux de présence** (pourcentage) - calculé sur le mois en cours
- **Nombre de mois d'entraînement** (depuis inscription)
- **Cours ce mois-ci** (avec comparaison vs mois précédent)
- **Série actuelle** (nombre de cours sans absence)

### Graphiques (Optionnel - Phase 2)
- Courbe de présence mensuelle (6 derniers mois)
- Répartition par type de cours
- Heures d'entraînement cumulées

---

## 3. Système de Niveaux et Points

### 🎯 Points par Badge

Chaque badge débloqué rapporte des points selon sa difficulté :

| Type de Badge | Difficulté | Points |
|---------------|------------|--------|
| Automatique Facile | Première Fois, Motivé (5 cours), Engagé (10 cours) | 10 pts |
| Automatique Moyen | Assidu (25), Fidèle (50), Série de 5 | 25 pts |
| Automatique Difficile | Centurion (100), Légende (250), Série de 10 | 50 pts |
| Automatique Très Difficile | Maître (500), Vétéran (3 ans) | 100 pts |
| Manuel du Coach | Techniques de base, Frappes, Défense | 30-50 pts |
| Manuel Coach Important | Pro du Couteau, Leader, Progression Remarquable | 75 pts |
| Personnalisé du Coach | Variable selon le coach | 10-100 pts |

### 🏆 Paliers de Niveaux

| Niveau | Titre | Points Requis | Badges Approximatifs |
|--------|-------|---------------|---------------------|
| 1 | Débutant | 0-50 pts | 0-5 badges |
| 2 | Apprenti | 51-150 pts | 5-10 badges |
| 3 | Pratiquant | 151-300 pts | 10-15 badges |
| 4 | Confirmé | 301-500 pts | 15-20 badges |
| 5 | Expert | 501-800 pts | 20-30 badges |
| 6 | Maître | 801-1200 pts | 30-40 badges |
| 7 | Légende | 1201+ pts | 40+ badges |

### 📊 Calcul et Progression

- **Points totaux** = Somme des points de tous les badges débloqués
- **Niveau actuel** = Calculé automatiquement selon les points
- **Barre de progression** = Points actuels / Points pour niveau suivant
- **Motivation** = "Plus que X points pour passer Niveau Y !"

---

## 4. Système de Badges

> **Affichage** : Tous les badges sont affichés de la même manière dans une **seule section**.
> **Backend** : La distinction auto/manuel est gérée dans la base de données uniquement.

### 📊 Types de Badges (en DB)

| Type | Description | Déblocage | Créé par |
|------|-------------|-----------|----------|
| **Automatique** | Basé sur des règles système | Automatique quand condition remplie | Système (pré-défini) |
| **Manuel** | Attribué par décision du coach | Manuel par le coach | Système (pré-défini) ou Coach (personnalisé) |

### 🎯 Badges Système (Pré-définis)

#### Badges Automatiques

#### Badges d'Assiduité
- 🎯 **Première Fois** - Premier cours suivi
- 🔥 **Motivé** - 5 cours suivis
- 💪 **Engagé** - 10 cours suivis
- 🏅 **Assidu** - 25 cours suivis
- ⭐ **Fidèle** - 50 cours suivis
- 💯 **Centurion** - 100 cours suivis
- 🏆 **Légende** - 250 cours suivis
- 👑 **Maître** - 500 cours suivis

#### Badges de Présence
- ⚡ **Sans Faute** - Présence parfaite pendant 1 mois (100%)
- 🔥 **Série de 5** - 5 cours consécutifs sans absence
- 💥 **Série de 10** - 10 cours consécutifs sans absence
- 🌟 **Trimestriel** - Présence >80% sur 3 mois
- 📅 **Annuel** - 1 an d'entraînement

#### Badges de Ponctualité
- ⏰ **Toujours à l'heure** - Présent à 10 cours à l'heure
- 🚀 **En avance** - Arrivé 10 min en avance à 5 cours

#### Badges de Discipline
- ✅ **Bon élève** - Annule à temps (24h+) 5 fois
- 🎖️ **Respect des règles** - Aucune annulation tardive en 3 mois
- 📧 **Communicant** - A renseigné toutes les infos du profil

#### Badges de Longévité
- 🗓️ **3 Mois** - Membre depuis 3 mois
- 📆 **6 Mois** - Membre depuis 6 mois
- 🎂 **1 An** - Membre depuis 1 an
- 🎉 **2 Ans** - Membre depuis 2 ans
- 💎 **Vétéran** - Membre depuis 3+ ans

---

#### Badges Manuels (Système)

**Badges Techniques**
- 🥋 **Techniques de Base** - Maîtrise des fondamentaux
- 👊 **Frappes Parfaites** - Excellentes techniques de frappe
- 🦵 **Maître des Jambes** - Techniques de jambes maîtrisées
- 🛡️ **Défenseur** - Excellentes parades et défenses
- 🔪 **Pro du Couteau** - Spécialiste défense contre couteau
- 🔫 **Contre Armes** - Spécialiste désarmement
- 🤼 **Saisies & Clés** - Expert en saisies et projections

#### Badges de Qualité
- 💡 **Esprit Vif** - Compréhension rapide des techniques
- 🧠 **Stratège** - Excellente analyse tactique
- ⚔️ **Combattant** - Excellent en sparring
- 🎯 **Précision** - Excellente précision des frappes
- 💥 **Puissance** - Frappes puissantes et efficaces
- 🐆 **Rapidité** - Vitesse d'exécution exceptionnelle

#### Badges d'Attitude
- 🤝 **Esprit d'équipe** - Excellent partenaire d'entraînement
- 💚 **Mentor** - Aide les nouveaux élèves
- 🌟 **Motivation** - Motivation exemplaire
- 🎖️ **Leader** - Exemple pour les autres
- 🏅 **Progression Remarquable** - Progrès exceptionnels

---

## 4. Informations Pratiques (Phase 2+)

### Abonnement (Optionnel)
- Type d'abonnement
- Date de renouvellement
- Statut du paiement

### Certificat Médical (Optionnel)
- Date d'expiration
- Statut (valide/expiré)
- Rappel avant expiration

---

## 5. Paramètres & Préférences (Simplifiés)

### Compte
- Modifier mot de passe
- Modifier email
- Se déconnecter

---

## 6. Design & UX

### Palette de Couleurs
- **Primaire** : Bleu (#3B82F6) - confiance, discipline
- **Secondaire** : Orange (#F59E0B) - énergie, combat
- **Accent** : Vert (#10B981) - progression, réussite
- **Danger** : Rouge (#EF4444) - arrêt, attention

### Composants Clés
- **Carte Profil** : Avatar + Nom + "Membre depuis X mois"
- **Cartes Statistiques** : Chiffres clés (cours, présence, série) + icônes
- **Section Badges** : 2 sections distinctes avec titres
- **Badge Component** : Icône + Nom + Description + État (débloqué/verrouillé)

### Style des Badges (Affichage Unifié)

> **Important** : Tous les badges sont affichés de la même manière, sans distinction visuelle entre automatiques et manuels.

#### Badge Débloqué
- **Style** : Fond coloré avec icône emoji
- **Bordure** : Standard (2px)
- **Information** : Date de déblocage
- **Si attribué par coach** : Afficher nom du coach + message personnalisé

#### Badge Verrouillé
- **Style** : Grisé avec icône cadenas 🔒
- **Information** : Condition de déblocage ou "À débloquer par le coach"
- **Si badge automatique** : Barre de progression (ex: 12/25 cours)

### Navigation
- ScrollView simple
- Modal pour édition du profil
- Section badges scrollable horizontalement par catégorie

### Structure de l'Écran Profil (Simplifié)

> **Note** : Les badges ont maintenant leur propre écran "Accomplissements"

```
┌─────────────────────────────────┐
│  [Avatar] Nom Prénom            │
│  Niveau 4 - Confirmé            │
│  ━━━━━━━━━━░░░░ 450/500 pts     │
│  12 badges • Membre depuis 8 mois│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  STATISTIQUES                   │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 45   │ │ 82%  │ │  8   │    │
│  │Cours │ │Prés. │ │Série │    │
│  └──────┘ └──────┘ └──────┘    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🏆 BADGES RÉCENTS              │
│  ┌───┐ ┌───┐ ┌───┐             │
│  │🎯 │ │🔥 │ │💪 │  → Voir tous│
│  └───┘ └───┘ └───┘             │
│  12/45 badges débloqués (27%)   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ACTIONS                        │
│  [Modifier mes informations]    │
│  [Se déconnecter]               │
└─────────────────────────────────┘
```

---

---

### 🆕 Badges Personnalisés (Créés par le Coach)

Le coach peut créer ses propres badges pour récompenser des comportements ou compétences spécifiques :
- **Exemples** : "Meilleur esprit d'équipe du mois", "Champion du sparring", "Élève le plus assidu de septembre"
- **Personnalisation** : Nom, description, icône emoji
- **Attribution** : Manuel uniquement

---

## 7. Nouvelle Structure : Écran "Mes Accomplissements"

### 💡 Proposition : 3ème Onglet dans la Navigation

**Au lieu de** : Cours | Profil
**On aura** : Cours | Accomplissements | Profil

### 📱 Écran "Mes Accomplissements"

```
┌─────────────────────────────────┐
│  🏆 MES ACCOMPLISSEMENTS        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  NIVEAU & PROGRESSION           │
│  ┌──────────────────┐           │
│  │ Niveau 4 - Confirmé         │
│  │ ━━━━━━━━━━░░░░ 450/500 pts │
│  │ Plus que 50 pts pour Niveau 5│
│  └──────────────────┘           │
│                                 │
│  ┌──────────────────┐           │
│  │ 12/45 badges débloqués      │
│  │ ████░░░░░░░  27%            │
│  └──────────────────┘           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  CATÉGORIES                     │
│  [Tous] [Assiduité] [Technique] │
│  [Présence] [Attitude]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  BADGES (scroll vertical)       │
│                                 │
│  ✅ 🎯 Première Fois            │
│     Premier cours suivi         │
│     Débloqué le 15 jan 2025    │
│                                 │
│  ✅ 🔥 Motivé                   │
│     5 cours suivis              │
│     Débloqué le 28 jan 2025    │
│                                 │
│  🔒 🏅 Assidu                   │
│     25 cours suivis             │
│     Progression: 12/25          │
│                                 │
│  ✅ 🔪 Pro du Couteau          │
│     Attribué par Paul           │
│     Le 10 mars 2025             │
│     "Excellent en défense..."   │
└─────────────────────────────────┘
```

### Avantages
- ✅ Plus d'espace pour afficher les badges
- ✅ Voir la progression de chaque badge
- ✅ Filtrer par catégorie
- ✅ Historique de déblocage
- ✅ Détails complets de chaque badge
- ✅ Message personnel du coach (pour badges manuels)

---

## 8. Structure de la Base de Données (Révisée)

### Table `profiles` (extension)
```sql
- id
- user_id (FK)
- total_classes (calculé)
- attendance_rate (calculé)
- join_date
- current_streak (série actuelle)
- longest_streak (meilleure série)
- total_points (calculé) - Points totaux accumulés
- current_level (calculé) - Niveau actuel (1-7)
- profile_picture_url
- medical_certificate_expiry (optionnel)
- created_at
- updated_at
```

### Table `badges` (Catalogue de tous les badges)
```sql
- id (UUID)
- code (unique string) - ex: "first_class", "pro_knife", "custom_sept_2025_1"
- name (string) - "Première Fois", "Pro du Couteau"
- description (text) - "Premier cours suivi"
- icon_emoji (string) - "🎯"
- points (integer) - Points rapportés par ce badge (10, 25, 50, 75, 100)
- type (enum) - "automatic" | "manual"
- category (enum) - "assiduity" | "presence" | "punctuality" | "discipline" | "longevity" | "technical" | "quality" | "attitude" | "custom"
- is_system (boolean) - true si badge pré-défini, false si créé par coach
- created_by (UUID nullable) - NULL si système, instructor_id si créé par coach
- requirement_rule (jsonb nullable) - Pour badges auto: {"type": "total_classes", "value": 5}
- display_order (integer) - Ordre d'affichage
- is_active (boolean) - Badge actif ou archivé
- created_at
- updated_at
```

### Table `user_badges` (Badges débloqués)
```sql
- id (UUID)
- user_id (UUID FK) - L'élève qui a reçu le badge
- badge_id (UUID FK) - Le badge obtenu
- unlocked_at (timestamp) - Date de déblocage
- awarded_by (UUID nullable) - NULL si auto, instructor_id si manuel
- coach_message (text nullable) - Message personnalisé du coach (optionnel)
- created_at
- UNIQUE(user_id, badge_id) - Un élève ne peut avoir le même badge qu'une fois
```

### Exemple de `requirement_rule` (JSONB)
```json
// Badge automatique: 5 cours
{
  "type": "total_classes",
  "operator": ">=",
  "value": 5
}

// Badge automatique: série de 10
{
  "type": "current_streak",
  "operator": ">=",
  "value": 10
}

// Badge automatique: membre depuis 6 mois
{
  "type": "membership_months",
  "operator": ">=",
  "value": 6
}

// Badge manuel: pas de règle
null
```

---

## 8. Phases d'Implémentation

### Phase 1 - MVP (Actuel) ✅
✅ Avatar + Nom + Email
✅ Informations de base (téléphone, rôle)
✅ Date d'inscription ("Membre depuis")
✅ Édition profil basique
✅ Déconnexion

### Phase 2 - Statistiques & Badges
- **Statistiques** :
  - Nombre total de cours suivis
  - Taux de présence (%)
  - Cours ce mois-ci
  - Série actuelle (consécutifs)

- **Système de Badges** :
  - Affichage des badges débloqués
  - Grille de tous les badges (verrouillés/débloqués)
  - Détail d'un badge (modal)
  - Calcul automatique des badges

- **Backend** :
  - Tables badges + user_badges
  - Logique de déblocage automatique
  - Interface admin pour badges manuels

### Phase 3 - Améliorations (Optionnel)
- Graphique de présence mensuelle
- Certificat médical (date d'expiration)
- Abonnement (type, renouvellement)
- Notifications push

---

## 9. Exemples de Cas d'Usage

### Élève Débutant (2 mois)
- **Membre depuis** : 2 mois
- **Cours suivis** : 12 cours
- **Présence** : 75%
- **Série** : 2 cours consécutifs
- **Niveau** : 1 (Débutant) - 30 points
- **Badges débloqués** : 3/45

**Badges débloqués** :
  - 🎯 Première Fois (10 pts)
  - 🔥 Motivé - 5 cours (10 pts)
  - 💪 Engagé - 10 cours (10 pts)

**Prochains badges** :
  - 🗓️ 3 Mois (dans 1 mois) - 25 pts
  - 🏅 Assidu - 25 cours (dans 13 cours) - 25 pts

### Élève Régulier (1 an)
- **Membre depuis** : 1 an
- **Cours suivis** : 78 cours
- **Présence** : 82%
- **Série** : 8 cours consécutifs
- **Niveau** : 4 (Confirmé) - 310 points
- **Badges débloqués** : 10/45

**Badges automatiques** (8):
  - Première Fois (10), Motivé (10), Engagé (10), Assidu (25), Fidèle (50), Série de 5 (25), 6 Mois (25), 1 An (50)
  - Total: 205 pts

**Badges du coach** (2):
  - 🥋 Techniques de Base - 30 pts (par Jean)
  - 🤝 Esprit d'équipe - 75 pts (par Marie)
  - Total: 105 pts

**Progression**: 190 pts pour passer Niveau 5 (Expert)

### Élève Assidu (3 ans)
- **Membre depuis** : 3 ans
- **Cours suivis** : 245 cours
- **Présence** : 88%
- **Série** : 15 cours consécutifs
- **Niveau** : 6 (Maître) - 945 points
- **Badges débloqués** : 23/45

**Badges automatiques** (18):
  - Assiduité: Première Fois (10), Motivé (10), Engagé (10), Assidu (25), Fidèle (50), Centurion (50), Légende (100)
  - Présence: Sans Faute (25), Série de 5 (25), Série de 10 (50)
  - Longévité: 3 Mois (25), 6 Mois (25), 1 An (50), 2 Ans (50), Vétéran (100)
  - Discipline: Bon élève (25), Respect des règles (25)
  - Total: 655 pts

**Badges du coach** (5):
  - 🔪 Pro du Couteau - 75 pts
  - 👊 Frappes Parfaites - 50 pts
  - 💚 Mentor - 50 pts
  - 🎖️ Leader - 75 pts
  - 🏅 Progression Remarquable - 40 pts
  - Total: 290 pts

**Progression**: 255 pts pour passer Niveau 7 (Légende)

---

## 10. Inspirations Design

### Style Visuel
- **Moderne et épuré** : Cards avec ombres légères
- **Gamifié** : Badges colorés, barres de progression
- **Motivant** : Citations, encouragements
- **Professionnel** : Typographie claire, hiérarchie visuelle

### Références
- Applications fitness (Nike Training, Strava)
- Applications d'apprentissage (Duolingo - système de badges)
- Profils sportifs (UFC, applications de clubs sportifs)

---

## 11. Prochaines Étapes

### Immédiat (Phase 2)
1. ✅ Plan validé - système de badges sans grades
2. Créer les migrations Supabase (tables badges, user_badges)
3. Implémenter l'affichage des statistiques
4. Créer les composants Badge (verrouillé/débloqué)
5. Implémenter la logique de déblocage automatique
6. Créer l'interface admin pour les badges manuels

### Court Terme
7. Tester avec quelques élèves
8. Ajuster les seuils des badges selon feedback
9. Ajouter graphiques de présence (Phase 3)
10. Notifications pour nouveaux badges

---

**Date de création** : 1er Octobre 2025
**Date de révision** : 1er Octobre 2025
**Statut** : Plan simplifié - Prêt pour implémentation Phase 2
