# 🎨 Plan de Refonte du Design - CKM66 Mobile

## 📋 Vue d'ensemble

Refonte complète du design de l'application mobile CKM66 en s'inspirant de l'interface admin Krav Maga (dark mode, accents rouges/oranges, design moderne et épuré).

---

## 1. Analyse du Design de Référence

### Style Visuel
- **Theme** : Dark mode élégant
- **Couleur principale** : Rouge/Orange (#E53E3E, #F56565)
- **Couleur de fond** : Gris très foncé (#1A202C, #2D3748)
- **Cartes/Conteneurs** : Gris foncé (#2D3748, #374151)
- **Texte** : Blanc/Gris clair (#F7FAFC, #E2E8F0)

### Éléments caractéristiques
- ✅ Logo avec chevrons rouges stylisés
- ✅ Sidebar sombre avec menu vertical
- ✅ Cards avec bordures arrondies
- ✅ Boutons rouges proéminents
- ✅ Icônes minimalistes
- ✅ Dégradé rouge subtil en arrière-plan

---

## 2. Nouvelle Palette de Couleurs

### Couleurs Principales
```javascript
const colors = {
  // Background
  background: {
    primary: '#1A202C',      // Fond principal très foncé
    secondary: '#2D3748',    // Fond secondaire (cards)
    tertiary: '#374151',     // Fond tertiaire (inputs)
  },

  // Accent (Rouge/Orange Krav Maga)
  primary: {
    50: '#FFF5F5',
    100: '#FED7D7',
    500: '#E53E3E',          // Rouge principal
    600: '#C53030',          // Rouge foncé
    700: '#9B2C2C',          // Rouge très foncé
  },

  secondary: {
    500: '#ED8936',          // Orange
    600: '#DD6B20',
  },

  // Texte
  text: {
    primary: '#F7FAFC',      // Blanc cassé
    secondary: '#E2E8F0',    // Gris très clair
    tertiary: '#A0AEC0',     // Gris moyen
    disabled: '#718096',     // Gris foncé
  },

  // États
  success: '#48BB78',        // Vert
  warning: '#ED8936',        // Orange
  error: '#E53E3E',          // Rouge
  info: '#4299E1',           // Bleu

  // Borders
  border: {
    light: '#4A5568',
    dark: '#2D3748',
  }
}
```

---

## 3. Typographie

### Fonts
```javascript
const typography = {
  fonts: {
    heading: 'Inter-Bold',      // Pour les titres
    body: 'Inter-Regular',      // Pour le texte
    mono: 'SF Mono',            // Pour les codes/badges
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
}
```

---

## 4. Composants à Créer/Refondre

### 4.1 Navigation Bottom Tab Bar (Dark)
```
┌─────────────────────────────────┐
│  [🏠]    [🏆]    [👤]           │
│  Cours  Accomp.  Profil         │
│  ━━━━━                          │
│  (Indicateur rouge sous actif)  │
└─────────────────────────────────┘
```

**Caractéristiques** :
- Fond : `#2D3748`
- Icônes : Blanches (inactives `#718096`, actives `#E53E3E`)
- Indicateur : Barre rouge 3px sous l'icône active
- Bordure top : `#4A5568` 1px

### 4.2 Header
```
┌─────────────────────────────────┐
│  ⚔️ KRAV MAGA                   │
│  Bonjour Martin 👋              │
└─────────────────────────────────┘
```

**Caractéristiques** :
- Fond : Dégradé `#E53E3E` → `#C53030`
- Texte : Blanc `#F7FAFC`
- Logo : Chevrons rouges stylisés
- Padding : 20px vertical, 16px horizontal

### 4.3 Cards/Conteneurs
```
┌─────────────────────────────────┐
│  TITRE                          │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │  Contenu de la card         ││
│  │                             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Caractéristiques** :
- Fond : `#2D3748`
- Bordure : `#4A5568` 1px
- Border radius : 16px
- Shadow : `0 4px 6px rgba(0,0,0,0.3)`
- Padding : 20px

### 4.4 Boutons

#### Bouton Primary (Rouge)
```
┌─────────────────────────┐
│   Se connecter   →      │
└─────────────────────────┘
```
- Fond : `#E53E3E`
- Hover/Press : `#C53030`
- Texte : Blanc `#F7FAFC`
- Border radius : 12px
- Padding : 16px vertical

#### Bouton Secondary (Outline)
```
┌─────────────────────────┐
│   Annuler               │
└─────────────────────────┘
```
- Fond : Transparent
- Bordure : `#E53E3E` 2px
- Texte : `#E53E3E`
- Border radius : 12px

#### Bouton Ghost
```
Mot de passe oublié ?
```
- Fond : Transparent
- Texte : `#A0AEC0`
- Underline au press

### 4.5 Inputs/Fields
```
┌─────────────────────────────────┐
│  👤  Email                      │
│     martin@example.com          │
└─────────────────────────────────┘
```

**Caractéristiques** :
- Fond : `#374151`
- Bordure : `#4A5568` 1px (focus : `#E53E3E` 2px)
- Texte : `#F7FAFC`
- Placeholder : `#718096`
- Border radius : 12px
- Padding : 16px
- Icône : `#A0AEC0` (active : `#E53E3E`)

### 4.6 Badges de Niveau
```
┌──────────────────┐
│  🏆  Niveau 4    │
│  Confirmé        │
└──────────────────┘
```

**Caractéristiques** :
- Fond : Dégradé selon niveau
  - Débutant : `#4A5568`
  - Apprenti : `#2D3748` + bordure bleue
  - Pratiquant : `#2D3748` + bordure verte
  - Confirmé : Dégradé orange `#ED8936`
  - Expert : Dégradé rouge `#E53E3E`
  - Maître : Dégradé violet `#9F7AEA`
  - Légende : Dégradé or `#F6AD55`
- Border radius : 12px
- Padding : 12px
- Emoji : 24px

### 4.7 Badges de Récompense
```
┌────────┐
│   🎯   │  (Débloqué - couleur vive)
└────────┘

┌────────┐
│   🔒   │  (Verrouillé - grisé)
└────────┘
```

**Débloqué** :
- Fond : `#2D3748`
- Bordure : Couleur selon catégorie (2px)
- Shadow : Glow coloré
- Emoji : Taille normale

**Verrouillé** :
- Fond : `#374151`
- Bordure : `#4A5568` 1px
- Opacité : 0.5
- Emoji : 🔒

### 4.8 Stats Cards
```
┌─────────────┐
│     45      │
│   📚 Cours  │
└─────────────┘
```

**Caractéristiques** :
- Fond : `#2D3748`
- Bordure : Gauche rouge 4px
- Border radius : 12px
- Chiffre : `#F7FAFC` 32px bold
- Label : `#A0AEC0` 14px

### 4.9 Barre de Progression
```
━━━━━━━━━━░░░░░░░░░░  60%
```

**Caractéristiques** :
- Fond : `#374151`
- Fill : Dégradé `#E53E3E` → `#ED8936`
- Height : 8px
- Border radius : 4px
- Texte % : `#E2E8F0` 14px

---

## 5. Écrans à Refondre

### 5.1 Écran de Login (AuthScreen)

**Avant** : Fond blanc, bleu classique
**Après** : Dark mode, rouge Krav Maga

```
┌─────────────────────────────────┐
│                                 │
│         ⚔️ KRAV MAGA           │
│         CKM66                   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  Admin Login            │   │
│  │                         │   │
│  │  👤 Email               │   │
│  │  [____________]         │   │
│  │                         │   │
│  │  🔒 Mot de passe        │   │
│  │  [____________]         │   │
│  │                         │   │
│  │  [   Se connecter  →  ] │   │
│  │                         │   │
│  │  Mot de passe oublié ?  │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 5.2 Écran Principal (MainApp)

**Header** : Dégradé rouge
**Tabs** : Dark avec indicateur rouge
**Fond** : `#1A202C`

### 5.3 Écran Profil (ProfileScreen)

```
┌─────────────────────────────────┐
│  ⚔️ KRAV MAGA                   │
│  Bonjour Martin 👋              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         [Photo]                 │
│      Martin Celavie             │
│      martin@example.com         │
│  Membre depuis 8 mois           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  PROGRESSION                    │
│  ┌─────────────────────────────┐│
│  │ 🏆  Niveau 4                ││
│  │     Confirmé                ││
│  │                             ││
│  │ ━━━━━━━━░░░░ 450/500 pts   ││
│  │                             ││
│  │ Plus que 50 pts pour        ││
│  │ passer Expert !             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  BADGES                         │
│  ┌─────────────────────────────┐│
│  │ 🏆 12/45 badges débloqués   ││
│  │ ████░░░░░░░  27%            ││
│  └─────────────────────────────┘│
│                                 │
│  📱 🔥 💪 → Voir tous           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  STATISTIQUES                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │  45   │ │  82%  │ │   8   │ │
│  │ Cours │ │ Prés. │ │ Série │ │
│  └───────┘ └───────┘ └───────┘ │
└─────────────────────────────────┘
```

### 5.4 Écran Accomplissements

**Fond** : Dark
**Badges** : Grille avec glow effect
**Filtres** : Pills rouges

---

## 6. Animations et Interactions

### Animations à ajouter
- ✨ **Glow effect** sur badges débloqués
- 🎊 **Confetti** lors du déblocage d'un badge
- 📈 **Compteur animé** pour les points (count-up)
- 🔄 **Rotation** de l'icône de chargement
- 💫 **Shimmer** sur les barres de progression
- 🎯 **Bounce** sur les boutons au press

### Transitions
- **Fade in** : Cards au chargement
- **Slide up** : Modals
- **Scale** : Badges au tap
- **Spring** : Tabs au changement

---

## 7. Structure des Fichiers

### Nouvelle organisation
```
src/
├── theme/
│   ├── colors.ts              # Palette complète
│   ├── typography.ts          # Fonts et tailles
│   ├── spacing.ts             # Espacements
│   ├── shadows.ts             # Ombres
│   └── index.ts               # Export global
│
├── components/ui/
│   ├── Button.tsx             # Bouton refait
│   ├── Card.tsx               # Card dark
│   ├── Input.tsx              # Input dark
│   ├── Badge.tsx              # Badge de récompense
│   ├── LevelBadge.tsx         # Badge de niveau
│   ├── ProgressBar.tsx        # Barre de progression
│   ├── StatCard.tsx           # Carte statistique
│   ├── TabBar.tsx             # Navigation refaite
│   └── Header.tsx             # Header avec dégradé
│
├── assets/
│   ├── logo-krav-maga.svg     # Logo chevrons
│   ├── gradient-bg.png        # Fond dégradé
│   └── badge-glow.png         # Effect glow
│
└── features/
    ├── auth/
    │   └── screens/
    │       └── AuthScreen.tsx  # Refait dark mode
    │
    └── profile/
        └── screens/
            └── ProfileScreen.tsx  # Refait dark mode
```

---

## 8. Plan d'Implémentation

### Phase 1 - Fondations (2-3h)
1. ✅ Créer le theme (`colors`, `typography`, `spacing`)
2. ✅ Installer les fonts (Inter)
3. ✅ Créer les composants de base (Button, Card, Input)
4. ✅ Créer le Header avec dégradé
5. ✅ Créer la TabBar dark

### Phase 2 - Écrans principaux (3-4h)
1. ✅ Refaire AuthScreen en dark mode
2. ✅ Refaire ProfileScreen avec nouveau design
3. ✅ Créer les composants de progression (LevelBadge, ProgressBar)
4. ✅ Créer les StatCards

### Phase 3 - Badges & Accomplissements (2-3h)
1. ✅ Créer le composant Badge avec glow
2. ✅ Refaire AccomplissementsScreen
3. ✅ Ajouter les filtres en pills
4. ✅ Implémenter le modal de détail

### Phase 4 - Animations & Polish (2-3h)
1. ✅ Ajouter les animations (glow, confetti, count-up)
2. ✅ Ajouter les transitions
3. ✅ Peaufiner les espacements
4. ✅ Tester sur différents devices

---

## 9. Composants Spéciaux

### Logo Krav Maga avec Chevrons
```jsx
<View style={styles.logoContainer}>
  <View style={styles.chevron1}>⟨</View>
  <View style={styles.chevron2}>⟨</View>
  <Text style={styles.logoText}>KRAV MAGA</Text>
</View>
```

### Dégradé Header
```jsx
import LinearGradient from 'expo-linear-gradient'

<LinearGradient
  colors={['#E53E3E', '#C53030']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.header}
>
  {/* Contenu */}
</LinearGradient>
```

### Glow Effect sur Badge
```jsx
<View style={styles.badgeContainer}>
  <View style={[styles.glow, { backgroundColor: badgeColor }]} />
  <View style={styles.badge}>
    <Text>{emoji}</Text>
  </View>
</View>

// Styles
glow: {
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: 16,
  opacity: 0.3,
  blur: 20,
}
```

---

## 10. Checklist de Migration

### Étape par étape
- [ ] Créer `src/theme/` avec couleurs et typographie
- [ ] Installer `expo-linear-gradient` pour les dégradés
- [ ] Créer les composants UI de base (Button, Card, Input)
- [ ] Créer le Header avec dégradé rouge
- [ ] Créer la TabBar dark avec indicateur rouge
- [ ] Refaire AuthScreen en dark mode
- [ ] Refaire ProfileScreen avec nouveau design
- [ ] Créer les badges avec glow effect
- [ ] Refaire AccomplissementsScreen
- [ ] Ajouter les animations
- [ ] Tester et peaufiner

---

## 11. Dépendances à Ajouter

```bash
# Dégradés
npm install expo-linear-gradient

# Animations avancées
npm install react-native-reanimated

# Haptic feedback
npm install expo-haptics

# Confetti (optionnel)
npm install react-native-confetti-cannon

# SVG (pour le logo)
npm install react-native-svg
```

---

## 12. Exemples de Code

### Theme Provider
```tsx
// src/theme/ThemeProvider.tsx
import { createContext, useContext } from 'react'
import { colors, typography, spacing } from './index'

const ThemeContext = createContext({ colors, typography, spacing })

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ colors, typography, spacing }}>
    {children}
  </ThemeContext.Provider>
)
```

### Button Component
```tsx
// src/components/ui/Button.tsx
import { useTheme } from '@/theme/ThemeProvider'

export const Button = ({ variant = 'primary', children, ...props }) => {
  const { colors } = useTheme()

  const variants = {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.text.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.primary[500],
      borderWidth: 2,
      color: colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.tertiary,
    }
  }

  return (
    <TouchableOpacity style={[styles.button, variants[variant]]} {...props}>
      <Text style={[styles.text, { color: variants[variant].color }]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
```

---

## 🎯 Objectif Final

**Transformer l'app actuelle (claire, bleue) en une app dark mode élégante avec l'identité visuelle Krav Maga (rouge/orange, moderne, percutante).**

**Timeline estimée** : 10-15 heures de développement

**Résultat attendu** : Une app visuellement cohérente avec l'interface admin, moderne et motivante pour les élèves ! 🥋🔥
