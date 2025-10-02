# 📘 Guide d'Exemples - Migration globalStyles

Ce guide contient des exemples concrets de migration vers les globalStyles.

## 🎯 Exemple 1: Screen Basique

### ❌ Avant (Ancien style)
```typescript
import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'

export function MyScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon Titre</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
})
```

### ✅ Après (Avec globalStyles)
```typescript
import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { globalStyles } from '@/theme'

export function MyScreen() {
  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollView}>
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Mon Titre</Text>
        </View>
      </ScrollView>
    </View>
  )
}

// Pas de StyleSheet.create nécessaire ! 🎉
```

---

## 📦 Exemple 2: Cartes et Listes

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
})
```

### ✅ Après
```typescript
import { StyleSheet } from 'react-native'
import { globalStyles } from '@/theme'

// globalStyles.card, globalStyles.cardTitle et globalStyles.listItem
// sont déjà disponibles !

const styles = StyleSheet.create({
  // Uniquement les styles spécifiques à ce screen
  customCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

// Dans le render:
<View style={globalStyles.card}>
  <Text style={globalStyles.cardTitle}>Titre</Text>
  <View style={styles.customCardContent}>
    {/* Contenu personnalisé */}
  </View>
</View>
```

---

## 🎨 Exemple 3: Boutons

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
})
```

### ✅ Après
```typescript
import { TouchableOpacity, Text } from 'react-native'
import { globalStyles } from '@/theme'

// Bouton primaire
<TouchableOpacity style={globalStyles.button}>
  <Text style={globalStyles.buttonText}>Confirmer</Text>
</TouchableOpacity>

// Bouton secondaire
<TouchableOpacity style={globalStyles.buttonSecondary}>
  <Text style={globalStyles.buttonSecondaryText}>Annuler</Text>
</TouchableOpacity>

// Bouton outline
<TouchableOpacity style={globalStyles.buttonOutline}>
  <Text style={globalStyles.buttonOutlineText}>Voir plus</Text>
</TouchableOpacity>
```

---

## 📝 Exemple 4: Formulaires

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
})
```

### ✅ Après
```typescript
import { View, Text, TextInput } from 'react-native'
import { globalStyles } from '@/theme'

<View style={globalStyles.inputWrapper}>
  <Text style={globalStyles.label}>Email</Text>
  <TextInput
    style={[globalStyles.input, hasError && globalStyles.inputError]}
    placeholder="votre@email.com"
  />
  {hasError && (
    <Text style={globalStyles.errorText}>Email invalide</Text>
  )}
</View>
```

---

## 🏷️ Exemple 5: Badges

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  successBadge: {
    backgroundColor: '#D1FAE5',
  },
  successBadgeText: {
    color: '#10B981',
  },
})
```

### ✅ Après
```typescript
import { View, Text } from 'react-native'
import { globalStyles } from '@/theme'

// Badge primaire
<View style={[globalStyles.badge, globalStyles.badgePrimary]}>
  <Text style={[globalStyles.badgeText, globalStyles.badgePrimaryText]}>
    Nouveau
  </Text>
</View>

// Badge succès
<View style={[globalStyles.badge, globalStyles.badgeSuccess]}>
  <Text style={[globalStyles.badgeText, globalStyles.badgeSuccessText]}>
    Validé
  </Text>
</View>

// Badge warning
<View style={[globalStyles.badge, globalStyles.badgeWarning]}>
  <Text style={[globalStyles.badgeText, globalStyles.badgeWarningText]}>
    En attente
  </Text>
</View>

// Badge error
<View style={[globalStyles.badge, globalStyles.badgeError]}>
  <Text style={[globalStyles.badgeText, globalStyles.badgeErrorText]}>
    Erreur
  </Text>
</View>
```

---

## 🎭 Exemple 6: Modals

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
})
```

### ✅ Après
```typescript
import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { globalStyles } from '@/theme'

<Modal visible={showModal} animationType="slide" transparent>
  <View style={globalStyles.modalOverlay}>
    <View style={globalStyles.modalContainer}>
      <View style={globalStyles.modalHeader}>
        <Text style={globalStyles.modalTitle}>Titre de la Modal</Text>
        <TouchableOpacity
          style={globalStyles.modalCloseButton}
          onPress={onClose}
        >
          <Text style={globalStyles.modalCloseButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      {/* Contenu */}
    </View>
  </View>
</Modal>
```

---

## 🔧 Exemple 7: Combiner globalStyles et styles personnalisés

Parfois, vous avez besoin de styles personnalisés en plus des globalStyles.

```typescript
import { StyleSheet } from 'react-native'
import { globalStyles, colors } from '@/theme'

const styles = StyleSheet.create({
  // Hériter d'un globalStyle et ajouter des propriétés
  customCard: {
    ...globalStyles.card,
    borderColor: colors.primary[500], // Personnalisation
    borderWidth: 2,
  },
  
  // Style totalement personnalisé
  specialLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
})

// Dans le render:
<View style={styles.customCard}>
  <Text style={globalStyles.cardTitle}>Titre</Text>
  <View style={styles.specialLayout}>
    {/* Layout personnalisé */}
  </View>
</View>

// Ou combiner inline:
<View style={[globalStyles.card, { borderColor: colors.primary[500] }]}>
  {/* Contenu */}
</View>
```

---

## 📐 Exemple 8: Utilities (Spacing, Flexbox)

Les globalStyles incluent des utilities pour éviter le code répétitif.

### ❌ Avant
```typescript
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text style={{ marginRight: 8 }}>Texte</Text>
  <Icon />
</View>

<View style={{ marginTop: 16, marginBottom: 16 }}>
  {/* Contenu */}
</View>

<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  {/* Centré */}
</View>
```

### ✅ Après
```typescript
import { globalStyles } from '@/theme'

// Row avec alignement
<View style={globalStyles.rowCenter}>
  <Text style={globalStyles.mr2}>Texte</Text>
  <Icon />
</View>

// Margins
<View style={[globalStyles.my3]}>
  {/* marginVertical: spacing.md (16) */}
</View>

// Centré
<View style={[globalStyles.flex1, globalStyles.center]}>
  {/* flex: 1, alignItems: center, justifyContent: center */}
</View>
```

---

## 🚨 Exemple 9: États Vides et Erreurs

### ✅ État Vide
```typescript
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '@/theme'

<View style={globalStyles.emptyCard}>
  <Ionicons name="folder-open-outline" size={48} color={colors.text.tertiary} />
  <Text style={[globalStyles.emptyText, globalStyles.mt2]}>
    Aucun élément disponible
  </Text>
</View>
```

### ✅ État d'Erreur
```typescript
<View style={globalStyles.errorBanner}>
  <Text style={globalStyles.errorBannerText}>
    Une erreur est survenue. Veuillez réessayer.
  </Text>
</View>
```

### ✅ État de Chargement
```typescript
import { ActivityIndicator } from 'react-native'
import { globalStyles, colors } from '@/theme'

<View style={globalStyles.loadingContainer}>
  <ActivityIndicator size="large" color={colors.primary[500]} />
  <Text style={globalStyles.loadingText}>Chargement...</Text>
</View>
```

---

## 🎨 Exemple 10: Icônes avec Containers

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
```

### ✅ Après
```typescript
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '@/theme'

// Container standard
<View style={globalStyles.iconContainer}>
  <Ionicons name="person" size={20} color={colors.text.primary} />
</View>

// Container large
<View style={globalStyles.iconContainerLarge}>
  <Ionicons name="trophy" size={28} color={colors.primary[500]} />
</View>

// Container avec couleur primaire
<View style={[globalStyles.iconContainer, globalStyles.iconContainerPrimary]}>
  <Ionicons name="star" size={20} color={colors.primary[500]} />
</View>
```

---

## 📋 Exemple 11: Détails avec Icônes (Rows)

### ✅ Implementation
```typescript
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '@/theme'

// Row de détail simple
<View style={globalStyles.detailRow}>
  <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
  <Text style={globalStyles.bodyText}>Il y a 2 heures</Text>
</View>

// Row de détail espacée
<View style={globalStyles.detailRowSpaced}>
  <Text style={globalStyles.bodyText}>Statut</Text>
  <Text style={globalStyles.bodyTextPrimary}>Actif</Text>
</View>
```

---

## �️ Exemple 12: Header et Navigation (TabBar)

### ❌ Avant
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
})
```

### ✅ Après
```typescript
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '@/theme'

export function MainApp() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>CKM66</Text>
        <Text style={globalStyles.headerSubtitle}>Bonjour Martin</Text>
      </View>

      {/* Tab Navigation */}
      <View style={globalStyles.tabBar}>
        <TouchableOpacity
          style={[globalStyles.tab, activeTab === 'home' && globalStyles.tabActive]}
          onPress={() => setActiveTab('home')}
        >
          <View style={globalStyles.tabContent}>
            <Ionicons
              name="home-outline"
              size={20}
              color={activeTab === 'home' ? colors.primary[500] : colors.text.secondary}
            />
            <Text style={[globalStyles.tabText, activeTab === 'home' && globalStyles.tabTextActive]}>
              Accueil
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.tab, activeTab === 'profile' && globalStyles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <View style={globalStyles.tabContent}>
            <Ionicons
              name="person-outline"
              size={20}
              color={activeTab === 'profile' ? colors.primary[500] : colors.text.secondary}
            />
            <Text style={[globalStyles.tabText, activeTab === 'profile' && globalStyles.tabTextActive]}>
              Profil
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {/* ... */}
    </View>
  )
}

// Aucun StyleSheet.create nécessaire ! 🎉
```

**Avantages**:
- Header réutilisable dans toute l'app
- Navigation cohérente avec le design system
- Couleurs dynamiques basées sur le thème
- 0 ligne de style local !

---

## �💡 Conseils de Migration

### DO ✅
- Utiliser globalStyles en premier
- Combiner avec styles personnalisés si nécessaire
- Garder les styles spécifiques à la logique métier
- Utiliser les utilities pour éviter le code inline

### DON'T ❌
- Ne pas dupliquer les globalStyles dans les screens
- Ne pas hardcoder les couleurs (utiliser `colors` du thème)
- Ne pas créer des styles identiques aux globalStyles
- Ne pas ignorer les utilities disponibles

---

*Pour plus d'informations, consultez `src/theme/README.md`*
