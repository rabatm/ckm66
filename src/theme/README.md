# Système de Thème - CKM66 App

Ce document explique comment utiliser le système de thème global de l'application.

## 📦 Structure

```
src/theme/
  ├── colors.ts          # Palette de couleurs (dark mode)
  ├── typography.ts      # Styles de typographie
  ├── spacing.ts         # Système d'espacement
  ├── shadows.ts         # Ombres et élévations
  ├── globalStyles.ts    # Styles réutilisables
  └── index.ts           # Point d'entrée
```

## 🎨 Utilisation

### Import basique

```typescript
import { colors, globalStyles } from '@/theme'
```

### Utilisation dans un composant

```typescript
import React from 'react'
import { View, Text } from 'react-native'
import { globalStyles } from '@/theme'

export function MyScreen() {
  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.section}>
        <Text style={globalStyles.sectionTitle}>Mon Titre</Text>
        
        <View style={globalStyles.card}>
          <Text style={globalStyles.cardTitle}>Carte Exemple</Text>
          <Text style={globalStyles.bodyText}>Contenu de la carte</Text>
        </View>
      </View>
    </View>
  )
}
```

### Combiner avec des styles personnalisés

```typescript
import { StyleSheet } from 'react-native'
import { globalStyles, colors } from '@/theme'

const styles = StyleSheet.create({
  customContainer: {
    ...globalStyles.container,
    paddingTop: 20, // Style personnalisé
  },
  
  customCard: {
    ...globalStyles.card,
    borderColor: colors.primary[500],
  },
})
```

## 🎯 Styles Disponibles

### Containers
- `container` - Container de base plein écran
- `containerWithPadding` - Container avec padding
- `scrollView` - ScrollView de base
- `centerContainer` - Container centré

### Sections
- `section` - Section avec padding
- `sectionTitle` - Titre de section
- `sectionSubtitle` - Sous-titre de section

### Cartes
- `card` - Carte standard
- `cardElevated` - Carte avec plus d'élévation
- `cardHeader` - En-tête de carte
- `cardTitle` - Titre de carte
- `cardSubtitle` - Sous-titre de carte
- `cardFooter` - Footer de carte

### Boutons
- `button` - Bouton primaire
- `buttonDisabled` - État désactivé
- `buttonText` - Texte de bouton
- `buttonSecondary` - Bouton secondaire
- `buttonOutline` - Bouton outline
- `buttonSmall` - Petit bouton

### Inputs
- `inputWrapper` - Wrapper d'input
- `label` - Label d'input
- `input` - Input standard
- `inputError` - État erreur
- `inputFocused` - État focus

### Header & Navigation
- `header` - En-tête de l'application
- `headerTitle` - Titre du header
- `headerSubtitle` - Sous-titre du header
- `tabBar` - Barre de navigation par onglets
- `tab` - Onglet individuel
- `tabActive` - Onglet actif
- `tabContent` - Contenu de l'onglet
- `tabText` - Texte de l'onglet
- `tabTextActive` - Texte de l'onglet actif

### Textes
- `title` - Titre principal
- `subtitle` - Sous-titre
- `bodyText` - Texte de corps
- `caption` - Texte de légende
- `errorText` - Texte d'erreur
- `successText` - Texte de succès

### Badges
- `badge` - Badge de base
- `badgePrimary` - Badge primaire
- `badgeSuccess` - Badge succès
- `badgeWarning` - Badge avertissement
- `badgeError` - Badge erreur

### Modals
- `modalOverlay` - Overlay de modal
- `modalContainer` - Container de modal
- `modalHeader` - En-tête de modal
- `modalTitle` - Titre de modal
- `modalCloseButton` - Bouton fermer

### Lists
- `listItem` - Item de liste
- `listItemContent` - Contenu d'item
- `listItemTitle` - Titre d'item
- `listItemSubtitle` - Sous-titre d'item

### Empty States
- `emptyContainer` - Container vide
- `emptyText` - Texte vide
- `emptyCard` - Carte vide

### Loading States
- `loadingContainer` - Container de chargement
- `loadingText` - Texte de chargement

### Error States
- `errorContainer` - Container d'erreur
- `errorBanner` - Bannière d'erreur
- `errorBannerText` - Texte de bannière d'erreur

### Spacing Utilities
- `mt0`, `mt1`, `mt2`, `mt3`, `mt4`, `mt5` - Margin top
- `mb0`, `mb1`, `mb2`, `mb3`, `mb4`, `mb5` - Margin bottom
- `mx0`, `mx1`, `mx2`, `mx3`, `mx4`, `mx5` - Margin horizontal
- `my0`, `my1`, `my2`, `my3`, `my4`, `my5` - Margin vertical
- `p0`, `p1`, `p2`, `p3`, `p4`, `p5` - Padding

### Flexbox Utilities
- `row` - Flexbox row
- `rowCenter` - Row centré
- `rowBetween` - Row space-between
- `column` - Flexbox column
- `center` - Centré
- `alignCenter`, `alignStart`, `alignEnd` - Alignement
- `justifyCenter`, `justifyBetween`, `justifyAround` - Justification
- `flex1` - flex: 1

### Icons
- `iconContainer` - Container d'icône standard
- `iconContainerLarge` - Container d'icône large
- `iconContainerPrimary` - Container avec couleur primaire

### Detail Rows
- `detailRow` - Ligne de détail avec icône
- `detailRowSpaced` - Ligne de détail espacée

## 🎨 Palette de Couleurs

```typescript
import { colors } from '@/theme'

// Couleurs primaires (Rouge Krav Maga)
colors.primary[500] // #B91C1C
colors.primary[600] // #991B1B

// Backgrounds (Dark Mode)
colors.background.primary   // #1A202C
colors.background.secondary // #2D3748
colors.background.tertiary  // #1A202C

// Textes
colors.text.primary    // #E2E8F0
colors.text.secondary  // #A0AEC0
colors.text.tertiary   // #718096
colors.text.disabled   // #4A5568

// Bordures
colors.border.light // #374151
colors.border.dark  // #7F1D1D

// États
colors.success // #10B981
colors.warning // #F59E0B
colors.error   // #EF4444
```

## 📐 Spacing

```typescript
import { spacing } from '@/theme'

spacing.xs  // 4
spacing.sm  // 8
spacing.md  // 16
spacing.lg  // 20
spacing.xl  // 32
```

## 🌑 Shadows

```typescript
import { shadows } from '@/theme'

shadows.sm  // Petite ombre
shadows.md  // Ombre moyenne
shadows.lg  // Grande ombre
shadows.xl  // Très grande ombre
```

## ✅ Bonnes Pratiques

1. **Toujours utiliser les globalStyles en premier** pour maintenir la cohérence
2. **Importer depuis `@/theme`** pour un import simplifié
3. **Combiner avec des styles personnalisés** seulement si nécessaire
4. **Ne pas hardcoder les couleurs** - toujours utiliser `colors`
5. **Utiliser les spacing utilities** au lieu de valeurs fixes

## 📝 Exemple Complet

```typescript
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '@/theme'

export function ExampleScreen() {
  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollView}>
        <View style={globalStyles.section}>
          {/* Titre de section */}
          <Text style={globalStyles.sectionTitle}>Ma Section</Text>
          
          {/* Carte */}
          <View style={globalStyles.card}>
            <View style={globalStyles.cardHeader}>
              <Text style={globalStyles.cardTitle}>Titre</Text>
              <View style={[globalStyles.badge, globalStyles.badgePrimary]}>
                <Text style={[globalStyles.badgeText, globalStyles.badgePrimaryText]}>
                  Nouveau
                </Text>
              </View>
            </View>
            
            {/* Contenu avec icône */}
            <View style={globalStyles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={globalStyles.bodyText}>Il y a 2 heures</Text>
            </View>
            
            <View style={globalStyles.cardFooter}>
              <Text style={globalStyles.caption}>Détails</Text>
              <TouchableOpacity style={globalStyles.buttonSmall}>
                <Text style={globalStyles.buttonSmallText}>Voir plus</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* État vide */}
          <View style={globalStyles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color={colors.text.tertiary} />
            <Text style={[globalStyles.emptyText, globalStyles.mt2]}>
              Aucun élément disponible
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
```

## 🔄 Migration

Pour migrer un écran existant vers les globalStyles :

1. Remplacer les imports de couleurs par `import { globalStyles, colors } from '@/theme'`
2. Identifier les styles qui correspondent aux globalStyles
3. Remplacer progressivement les styles personnalisés
4. Supprimer les styles redondants

Exemple de migration :

```typescript
// ❌ Avant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
  },
})

// ✅ Après
import { globalStyles } from '@/theme'

// Utiliser directement globalStyles.container et globalStyles.card
```
