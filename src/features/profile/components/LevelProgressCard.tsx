import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, typography } from '@/theme'
import { DarkCard } from '@/components/ui'
import type { UserProgress } from '../types/badge.types'

interface LevelProgressCardProps {
  userProgress: UserProgress
}

export function LevelProgressCard({ userProgress }: LevelProgressCardProps) {
  return (
    <DarkCard>
      <View style={styles.levelHeader}>
        <LinearGradient
          colors={[userProgress.level_info.color, colors.background.tertiary]}
          style={styles.levelBadge}
        >
          <Text style={styles.levelBadgeNumber}>{userProgress.current_level}</Text>
        </LinearGradient>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelTitle, { color: userProgress.level_info.color }]}>
            {userProgress.level_info.title}
          </Text>
          <Text style={styles.levelPoints}>
            {userProgress.total_points} points
          </Text>
        </View>
      </View>

      {userProgress.next_level_info && (
        <>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${userProgress.progress_percentage}%`,
                    backgroundColor: userProgress.level_info.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(userProgress.progress_percentage)}%
            </Text>
          </View>
          <Text style={styles.motivationText}>
            Plus que {userProgress.points_to_next_level} pts pour passer {userProgress.next_level_info.title} !
          </Text>
        </>
      )}
    </DarkCard>
  )
}

const styles = StyleSheet.create({
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelBadgeNumber: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  levelPoints: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    width: 40,
    textAlign: 'right',
  },
  motivationText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
