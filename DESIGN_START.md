# 🚀 Démarrage Rapide - Refonte Design Dark Mode

## ⚡ Installation et Setup (5 min)

### 1. Installer les dépendances nécessaires

```bash
# Dégradés
npm install expo-linear-gradient

# Animations
npm install react-native-reanimated

# Haptic feedback
npm install expo-haptics

# Optionnel : Confetti
npm install react-native-confetti-cannon
```

### 2. Créer la structure du theme

```bash
# Créer les dossiers
mkdir -p src/theme
mkdir -p src/components/ui
```

---

## 📝 Fichiers à créer

### 1. Palette de couleurs (`src/theme/colors.ts`)

```typescript
export const colors = {
  // Background
  background: {
    primary: '#1A202C',      // Fond principal
    secondary: '#2D3748',    // Cards
    tertiary: '#374151',     // Inputs
  },

  // Accent Krav Maga (Rouge/Orange)
  primary: {
    500: '#B91C1C',          // Rouge principal plus sombre
    600: '#991B1B',          // Rouge très foncé
  },

  secondary: {
    500: '#ED8936',          // Orange
  },

  // Texte
  text: {
    primary: '#F7FAFC',      // Blanc cassé
    secondary: '#E2E8F0',    // Gris clair
    tertiary: '#A0AEC0',     // Gris moyen
    disabled: '#718096',     // Gris foncé
  },

  // États
  success: '#48BB78',
  warning: '#ED8936',
  error: '#E53E3E',

  // Borders
  border: {
    light: '#7F1D1D',    // Rouge sombre clair
    dark: '#450A0A',     // Rouge très sombre
  }
}
```

### 2. Typographie (`src/theme/typography.ts`)

```typescript
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },

  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
}
```

### 3. Espacements (`src/theme/spacing.ts`)

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
}
```

### 4. Export global (`src/theme/index.ts`)

```typescript
export { colors } from './colors'
export { typography } from './typography'
export { spacing } from './spacing'

export const theme = {
  colors,
  typography,
  spacing,
}
```

---

## 🎨 Premier Composant : Button Dark

### `src/components/ui/DarkButton.tsx`

```tsx
import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, typography, spacing } from '@/theme'

interface DarkButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
  onPress?: () => void
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

export const DarkButton: React.FC<DarkButtonProps> = ({
  variant = 'primary',
  children,
  onPress,
  loading,
  disabled,
  icon,
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    disabled && styles.disabled,
  ]

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'ghost' && styles.ghostText,
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.text.primary : colors.primary[500]} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.text.tertiary,
  },
})
```

---

## 🎨 Deuxième Composant : Input Dark

### `src/components/ui/DarkInput.tsx`

```tsx
import React, { useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@/theme'

interface DarkInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  secureTextEntry?: boolean
  icon?: React.ReactNode
  error?: string
}

export const DarkInput: React.FC<DarkInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  icon,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.lg,
  },
  inputFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
})
```

---

## 🎨 Troisième Composant : Card Dark

### `src/components/ui/DarkCard.tsx`

```tsx
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing } from '@/theme'

interface DarkCardProps {
  children: React.ReactNode
  style?: ViewStyle
  noPadding?: boolean
}

export const DarkCard: React.FC<DarkCardProps> = ({
  children,
  style,
  noPadding,
}) => {
  return (
    <View style={[
      styles.card,
      noPadding && styles.noPadding,
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  noPadding: {
    padding: 0,
  },
})
```

---

## 🎨 Quatrième Composant : Header avec Dégradé

### `src/components/ui/DarkHeader.tsx`

```tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, typography, spacing } from '@/theme'

interface DarkHeaderProps {
  title: string
  subtitle?: string
}

export const DarkHeader: React.FC<DarkHeaderProps> = ({ title, subtitle }) => {
  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.chevron}>⟨</Text>
        <Text style={styles.chevron}>⟨</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chevron: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    marginRight: -8,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    opacity: 0.9,
  },
})
```

---

## 🧪 Test Rapide

### Modifier `App.tsx` pour tester

```tsx
import { DarkButton } from './src/components/ui/DarkButton'
import { DarkInput } from './src/components/ui/DarkInput'
import { DarkCard } from './src/components/ui/DarkCard'
import { DarkHeader } from './src/components/ui/DarkHeader'
import { colors } from './src/theme'

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <DarkHeader title="KRAV MAGA" subtitle="Bonjour Martin 👋" />

      <View style={{ padding: 20 }}>
        <DarkCard>
          <DarkInput
            label="Email"
            placeholder="martin@example.com"
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

---

## 📋 Checklist Démarrage

- [ ] Installer les dépendances (`expo-linear-gradient`, etc.)
- [ ] Créer `src/theme/` avec colors, typography, spacing
- [ ] Créer les composants de base (DarkButton, DarkInput, DarkCard, DarkHeader)
- [ ] Tester avec un écran simple
- [ ] Adapter AuthScreen avec les nouveaux composants
- [ ] Continuer avec ProfileScreen
- [ ] Implémenter les badges et badges de niveau

---

## 🎯 Prochaine Étape

Une fois les composants de base créés, on peut :
1. Refaire l'écran de login (AuthScreen)
2. Refaire l'écran de profil (ProfileScreen)
3. Ajouter les animations et effets spéciaux

**Voulez-vous que je commence par créer ces composants de base ?** 🚀
