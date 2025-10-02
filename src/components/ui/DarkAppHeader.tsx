import React from 'react'
import { View, Text, Image, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, typography } from '@/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { UserLevel } from '@/features/profile/types/badge.types'
import { LEVELS } from '@/features/profile/types/badge.types'

interface DarkAppHeaderProps {
  firstName?: string
  profilePictureUrl?: string | null
  level?: UserLevel
  totalPoints?: number
}

/**
 * iOS-style glass design app header with user info
 * Shows avatar, first name, and level
 */
export const DarkAppHeader: React.FC<DarkAppHeaderProps> = ({
  firstName = 'Utilisateur',
  profilePictureUrl,
  level = 1,
  totalPoints = 0,
}) => {
  const insets = useSafeAreaInsets()
  const levelInfo = LEVELS[level]

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === 'ios' ? insets.top : spacing.md,
        },
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(185, 28, 28, 0.2)', 'rgba(26, 32, 44, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profilePictureUrl ? (
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {/* Level indicator badge on avatar */}
              <LinearGradient
                colors={[levelInfo.color, colors.background.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.levelBadge}
              >
                <Text style={styles.levelBadgeText}>{level}</Text>
              </LinearGradient>
            </View>

            {/* User info */}
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Bonjour 👋</Text>
              <Text style={styles.name}>{firstName}</Text>
              <View style={styles.levelContainer}>
                <View
                  style={[
                    styles.levelDot,
                    { backgroundColor: levelInfo.color },
                  ]}
                />
                <Text style={styles.levelText}>{levelInfo.title}</Text>
                <Text style={styles.pointsText}>• {totalPoints} pts</Text>
              </View>
            </View>

            {/* Chevron Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.chevron}>⟨</Text>
              <Text style={styles.chevron}>⟨</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  blurContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(185, 28, 28, 0.3)',
    // Shadow for depth
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    paddingBottom: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  levelText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    marginLeft: -4,
  },
})
