import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { DarkCard } from '@/components/ui'

interface BadgeStatsCardProps {
  unlockedBadges: number
  totalBadges: number
  badgesPercentage: number
}

export function BadgeStatsCard({ unlockedBadges, totalBadges, badgesPercentage }: BadgeStatsCardProps) {
  return (
    <DarkCard>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color={colors.secondary[500]} />
        <Text style={styles.text}>
          {unlockedBadges}/{totalBadges} badges débloqués
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${badgesPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round(badgesPercentage)}%
        </Text>
      </View>
    </DarkCard>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary[500],
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    width: 40,
    textAlign: 'right',
  },
})
