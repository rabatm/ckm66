# 🌙 Dark Mode Krav Maga - Instructions

## ✅ Ce qui a été créé

### 1. Système de Theme complet
- ✅ `src/theme/colors.ts` - Palette dark complète
- ✅ `src/theme/typography.ts` - Tailles et poids
- ✅ `src/theme/spacing.ts` - Espacements
- ✅ `src/theme/shadows.ts` - Ombres
- ✅ `src/theme/index.ts` - Export global

### 2. Composants UI Dark
- ✅ `src/components/ui/DarkButton.tsx` - Bouton (primary/secondary/ghost)
- ✅ `src/components/ui/DarkInput.tsx` - Input avec états focus/error
- ✅ `src/components/ui/DarkCard.tsx` - Conteneur dark
- ✅ `src/components/ui/DarkHeader.tsx` - Header avec dégradé rouge
- ✅ `src/components/ui/index.ts` - Export centralisé

### 3. Écran de Test
- ✅ `src/components/ui/TestDarkScreen.tsx` - Démo de tous les composants

---

## 🚀 Comment tester maintenant

### Option 1 : Modifier App.tsx (Rapide)

Remplacez le contenu de `src/App.tsx` par :

```tsx
import { TestDarkScreen } from './components/ui/TestDarkScreen'

export default function App() {
  return <TestDarkScreen />
}
```

Puis lancez l'app :
```bash
npm start
```

### Option 2 : Intégrer dans MainApp

Modifier `src/features/main/screens/MainApp.tsx` :

```tsx
import { TestDarkScreen } from '@/components/ui/TestDarkScreen'

// Dans la navigation, ajoutez un onglet "Test"
case 'test':
  return <TestDarkScreen />
```

---

## 🎨 Comment utiliser les composants

### DarkButton

```tsx
import { DarkButton } from '@/components/ui'

// Primary (rouge)
<DarkButton variant="primary" onPress={handlePress}>
  Se connecter →
</DarkButton>

// Secondary (outline rouge)
<DarkButton variant="secondary" onPress={handlePress}>
  Annuler
</DarkButton>

// Ghost (transparent)
<DarkButton variant="ghost" onPress={handlePress}>
  Mot de passe oublié ?
</DarkButton>

// Avec loading
<DarkButton variant="primary" loading={isLoading}>
  Connexion...
</DarkButton>
```

### DarkInput

```tsx
import { DarkInput } from '@/components/ui'

<DarkInput
  label="Email"
  placeholder="martin@example.com"
  value={email}
  onChangeText={setEmail}
  icon={<Text>👤</Text>}
  keyboardType="email-address"
/>

// Avec erreur
<DarkInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error="Email invalide"
/>
```

### DarkCard

```tsx
import { DarkCard } from '@/components/ui'

// Avec padding par défaut
<DarkCard>
  <Text style={{ color: '#fff' }}>Contenu</Text>
</DarkCard>

// Sans padding
<DarkCard noPadding>
  <View style={{ padding: 20 }}>
    <Text style={{ color: '#fff' }}>Contenu</Text>
  </View>
</DarkCard>
```

### DarkHeader

```tsx
import { DarkHeader } from '@/components/ui'

// Avec logo chevrons
<DarkHeader
  title="KRAV MAGA"
  subtitle="Bonjour Martin 👋"
/>

// Sans logo
<DarkHeader
  title="Mon Profil"
  showLogo={false}
/>
```

---

## 🎯 Prochaines étapes

### 1. Refaire AuthScreen en dark mode

Fichier : `src/features/auth/screens/AuthScreen.tsx`

```tsx
import { View } from 'react-native'
import { DarkHeader, DarkCard, DarkInput, DarkButton } from '@/components/ui'
import { colors } from '@/theme'

export function AuthScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <DarkHeader title="KRAV MAGA" subtitle="CKM66" />

      <View style={{ padding: 20 }}>
        <DarkCard>
          <DarkInput
            label="Email"
            placeholder="votre@email.com"
            icon={<Text>👤</Text>}
          />

          <DarkInput
            label="Mot de passe"
            placeholder="••••••••"
            secureTextEntry
            icon={<Text>🔒</Text>}
          />

          <DarkButton variant="primary">
            Se connecter →
          </DarkButton>

          <DarkButton variant="ghost">
            Mot de passe oublié ?
          </DarkButton>
        </DarkCard>
      </View>
    </View>
  )
}
```

### 2. Refaire ProfileScreen

Utiliser les mêmes composants pour un look cohérent :
- `DarkHeader` pour le header
- `DarkCard` pour les sections
- `colors.background.primary` pour le fond

### 3. Créer les composants spécialisés

#### Badge de Niveau
```tsx
// src/components/ui/LevelBadge.tsx
<View style={{ backgroundColor: colors.level[level] }}>
  <Text>🏆 Niveau {level}</Text>
  <Text>{title}</Text>
</View>
```

#### Badge de Récompense
```tsx
// src/components/ui/RewardBadge.tsx
<View style={{
  backgroundColor: colors.background.secondary,
  borderColor: isUnlocked ? colors.primary[500] : colors.border.light,
  borderWidth: 2,
  opacity: isUnlocked ? 1 : 0.5,
}}>
  <Text>{emoji}</Text>
</View>
```

---

## 📊 Palette de couleurs disponible

```typescript
import { colors } from '@/theme'

// Backgrounds
colors.background.primary    // #1A202C - Fond principal
colors.background.secondary  // #2D3748 - Cards
colors.background.tertiary   // #374151 - Inputs

// Accents
colors.primary[500]          // #E53E3E - Rouge Krav Maga
colors.primary[600]          // #C53030 - Rouge foncé
colors.secondary[500]        // #ED8936 - Orange

// Texte
colors.text.primary          // #F7FAFC - Blanc cassé
colors.text.secondary        // #E2E8F0 - Gris clair
colors.text.tertiary         // #A0AEC0 - Gris moyen
colors.text.disabled         // #718096 - Gris foncé

// États
colors.success               // #48BB78 - Vert
colors.error                 // #E53E3E - Rouge
colors.warning               // #ED8936 - Orange

// Niveaux
colors.level[1]              // Débutant - Gris
colors.level[2]              // Apprenti - Bleu
colors.level[3]              // Pratiquant - Vert
colors.level[4]              // Confirmé - Orange
colors.level[5]              // Expert - Rouge
colors.level[6]              // Maître - Violet
colors.level[7]              // Légende - Or
```

---

## 🔧 Dépendances installées

✅ `expo-linear-gradient` - Pour les dégradés (déjà installé)

### À installer (optionnel) :

```bash
# Pour animations avancées
npm install react-native-reanimated

# Pour haptic feedback
npm install expo-haptics

# Pour confetti (déblocage badges)
npm install react-native-confetti-cannon
```

---

## ✅ Checklist Migration

- [x] Créer le système de theme
- [x] Créer les composants UI de base
- [x] Créer l'écran de test
- [ ] Tester l'écran de démo
- [ ] Refaire AuthScreen
- [ ] Refaire ProfileScreen
- [ ] Refaire AccomplissementsScreen
- [ ] Créer LevelBadge component
- [ ] Créer RewardBadge component
- [ ] Ajouter les animations
- [ ] Finaliser le design

---

## 🎉 Résultat attendu

**Avant** :
- Fond blanc
- Bleu classique (#3B82F6)
- Design simple

**Après** :
- 🌑 Fond dark (#1A202C)
- 🔥 Rouge/Orange Krav Maga (#E53E3E)
- ⚔️ Logo avec chevrons
- 💫 Design moderne et impactant

---

## 🚀 Testez maintenant !

1. Lancez l'app : `npm start`
2. Ouvrez `TestDarkScreen` pour voir les composants
3. Commencez à migrer vos écrans !

**Tout est prêt !** 🎊
