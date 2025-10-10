# ✅ Dark Mode Krav Maga - COMPLET !

## 🎉 Tout est créé et prêt !

### ✅ Système de Theme (5 fichiers)

| Fichier | Description | Statut |
|---------|-------------|--------|
| `src/theme/colors.ts` | Palette complète dark + rouge Krav Maga | ✅ |
| `src/theme/typography.ts` | Tailles et poids de texte | ✅ |
| `src/theme/spacing.ts` | Espacements | ✅ |
| `src/theme/shadows.ts` | Ombres | ✅ |
| `src/theme/index.ts` | Export global | ✅ |

### ✅ Composants UI Dark (5 fichiers)

| Composant | Description | Statut |
|-----------|-------------|--------|
| `DarkButton` | Bouton (primary/secondary/ghost) | ✅ |
| `DarkInput` | Input avec focus/error | ✅ |
| `DarkCard` | Conteneur dark | ✅ |
| `DarkHeader` | Header avec dégradé rouge | ✅ |
| `TestDarkScreen` | Écran de démo | ✅ |

### ✅ Dépendances

| Package | Statut |
|---------|--------|
| `expo-linear-gradient` | ✅ Déjà installé |

---

## 🚀 COMMENT TESTER MAINTENANT (3 options)

### Option 1 : Remplacer App.tsx (Le plus rapide)

**Remplacez** le contenu de `src/App.tsx` par :

```tsx
import React from 'react'
import { TestDarkScreen } from './components/ui/TestDarkScreen'

export default function App() {
  return <TestDarkScreen />
}
```

### Option 2 : Utiliser le fichier de test

Copiez le contenu de `TEST_DARK_MODE.tsx` dans `src/App.tsx`

### Option 3 : Ajouter comme écran dans MainApp

Dans `src/features/main/screens/MainApp.tsx` :

```tsx
import { TestDarkScreen } from '@/components/ui/TestDarkScreen'

// Ajoutez 'test' au type
type TabType = 'schedule' | 'accomplishments' | 'profile' | 'test'

// Dans renderTabContent()
case 'test':
  return <TestDarkScreen />

// Ajoutez le tab dans la navigation
<TouchableOpacity
  style={[styles.tab, activeTab === 'test' && styles.activeTab]}
  onPress={() => setActiveTab('test')}
>
  <Text style={[styles.tabText, activeTab === 'test' && styles.activeTabText]}>
    🌙 Dark
  </Text>
</TouchableOpacity>
```

---

## 🎨 Ce que vous verrez

L'écran de test contient :

### 🔐 Section Connexion
- Input Email avec icône
- Input Mot de passe sécurisé
- Bouton Primary avec loading
- Bouton Ghost pour "Mot de passe oublié"

### 🎨 Section Boutons
- Bouton Primary (rouge)
- Bouton Secondary (outline rouge)
- Bouton Ghost (transparent)
- Bouton Disabled

### 📦 Section Cards
- Card standard avec padding
- Card sans padding

### 📊 Section Stats
- 3 stat cards (Cours, Présence, Série)
- Bordure gauche rouge
- Chiffres en grand

### 🎨 Section Palette
- Aperçu de toutes les couleurs
- Primary Red, Secondary Orange, Success Green
- Backgrounds

---

## 🎯 Prochaines étapes

### 1. Tester l'écran de démo ✅

Lancez l'app pour voir tous les composants :
```bash
npm start
```

### 2. Refaire AuthScreen

Fichier : `src/features/auth/screens/AuthScreen.tsx`

Remplacez par :

```tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { DarkHeader, DarkCard, DarkInput, DarkButton } from '@/components/ui'
import { colors, spacing } from '@/theme'
import { useAuth } from '../hooks/useAuth'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signIn({ email, password })
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <DarkHeader title="KRAV MAGA" subtitle="CKM66" />

      <View style={styles.content}>
        <DarkCard>
          <Text style={styles.title}>Connexion</Text>

          <DarkInput
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            icon={<Text style={styles.icon}>👤</Text>}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <DarkInput
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Text style={styles.icon}>🔒</Text>}
          />

          <DarkButton
            variant="primary"
            onPress={handleLogin}
            loading={loading}
          >
            Se connecter →
          </DarkButton>

          <View style={styles.divider} />

          <DarkButton variant="ghost" onPress={() => {}}>
            Mot de passe oublié ?
          </DarkButton>
        </DarkCard>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  icon: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },
})
```

### 3. Refaire ProfileScreen

Utilisez les mêmes composants :

```tsx
import { View, ScrollView } from 'react-native'
import { DarkHeader, DarkCard } from '@/components/ui'
import { colors } from '@/theme'

export function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <DarkHeader
        title="KRAV MAGA"
        subtitle={`Bonjour ${user?.first_name} 👋`}
      />

      <ScrollView>
        <DarkCard>
          {/* Votre contenu */}
        </DarkCard>
      </ScrollView>
    </View>
  )
}
```

### 4. Créer les composants spécialisés

#### LevelBadge
```tsx
// src/components/ui/LevelBadge.tsx
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, typography, spacing } from '@/theme'

interface LevelBadgeProps {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7
  title: string
  points: number
}

export function LevelBadge({ level, title, points }: LevelBadgeProps) {
  return (
    <LinearGradient
      colors={[colors.level[level], colors.background.secondary]}
      style={styles.badge}
    >
      <Text style={styles.emoji}>🏆</Text>
      <Text style={styles.level}>Niveau {level}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.points}>{points} pts</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  badge: {
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  level: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  points: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
})
```

#### RewardBadge
```tsx
// src/components/ui/RewardBadge.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'

interface RewardBadgeProps {
  emoji: string
  name: string
  isUnlocked: boolean
  onPress?: () => void
}

export function RewardBadge({ emoji, name, isUnlocked, onPress }: RewardBadgeProps) {
  return (
    <TouchableOpacity
      style={[
        styles.badge,
        !isUnlocked && styles.locked,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, isUnlocked && styles.unlocked]}>
        <Text style={styles.emoji}>{isUnlocked ? emoji : '🔒'}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    width: 100,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  unlocked: {
    borderColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  locked: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
```

---

## 📦 Fichiers créés (Récapitulatif)

### Theme (5)
- ✅ `src/theme/colors.ts`
- ✅ `src/theme/typography.ts`
- ✅ `src/theme/spacing.ts`
- ✅ `src/theme/shadows.ts`
- ✅ `src/theme/index.ts`

### Composants UI (6)
- ✅ `src/components/ui/DarkButton.tsx`
- ✅ `src/components/ui/DarkInput.tsx`
- ✅ `src/components/ui/DarkCard.tsx`
- ✅ `src/components/ui/DarkHeader.tsx`
- ✅ `src/components/ui/TestDarkScreen.tsx`
- ✅ `src/components/ui/index.ts`

### Documentation (5)
- ✅ `DESIGN_PLAN.md` - Plan complet
- ✅ `DESIGN_START.md` - Guide de démarrage
- ✅ `DARK_MODE_INSTRUCTIONS.md` - Instructions d'utilisation
- ✅ `TEST_DARK_MODE.tsx` - Fichier de test rapide
- ✅ `DARK_MODE_COMPLETE.md` - Ce fichier

---

## ✅ Checklist de Migration

- [x] Créer le système de theme
- [x] Créer DarkButton
- [x] Créer DarkInput
- [x] Créer DarkCard
- [x] Créer DarkHeader
- [x] Créer TestDarkScreen
- [x] Installer expo-linear-gradient
- [ ] **Tester l'écran de démo**
- [ ] Refaire AuthScreen
- [ ] Refaire ProfileScreen
- [ ] Refaire AccomplissementsScreen
- [ ] Créer LevelBadge
- [ ] Créer RewardBadge
- [ ] Créer ProgressBar dark
- [ ] Créer StatCard
- [ ] Ajouter animations
- [ ] Finaliser

---

## 🎨 Palette disponible

```typescript
import { colors } from '@/theme'

// Backgrounds
colors.background.primary    // #1A202C
colors.background.secondary  // #2D3748
colors.background.tertiary   // #374151

// Accents
colors.primary[500]          // #E53E3E (Rouge Krav Maga)
colors.secondary[500]        // #ED8936 (Orange)

// Texte
colors.text.primary          // #F7FAFC
colors.text.secondary        // #E2E8F0
colors.text.tertiary         // #A0AEC0

// Niveaux
colors.level[1]              // Gris
colors.level[2]              // Bleu
colors.level[3]              // Vert
colors.level[4]              // Orange
colors.level[5]              // Rouge
colors.level[6]              // Violet
colors.level[7]              // Or
```

---

## 🚀 Lancez maintenant !

```bash
npm start
```

**Remplacez `src/App.tsx` par le contenu de `TEST_DARK_MODE.tsx` pour voir la démo !**

---

## 🎉 Résultat

Vous avez maintenant :
- ✅ Un système de theme complet dark mode
- ✅ 4 composants UI réutilisables
- ✅ Un écran de test avec tous les exemples
- ✅ Une palette Krav Maga (rouge/orange)
- ✅ Des exemples de code pour chaque composant

**Le design dark mode Krav Maga est prêt !** 🥋🔥
