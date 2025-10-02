import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing } from '@/theme'

interface DarkHeaderProps {
  title: string
  subtitle?: string
  showLogo?: boolean
}

export const DarkHeader: React.FC<DarkHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
}) => {
  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.content}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} style={styles.chevronIcon} />
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} style={styles.chevronIcon} />
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        {!showLogo && (
          <Text style={styles.title}>{title}</Text>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  content: {
    // Optional: ajout d'un conteneur pour plus de flexibilité
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chevronIcon: {
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
    marginTop: spacing.xs,
  },
})
