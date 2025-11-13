import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import type { BadgeWithProgress } from '../services/badge.service'
import { BadgeDetailModal } from './BadgeDetailModal'

interface BadgesListProps {
  badges: BadgeWithProgress[]
  isLoading: boolean
}

const BadgeItem: React.FC<{ badge: BadgeWithProgress; onPress: () => void }> = ({ badge, onPress }) => {
  // Map category to display name
  const categoryLabels: Record<string, string> = {
    assiduity: '📊 Assiduité',
    presence: '🎯 Présence',
    punctuality: '⏰ Ponctualité',
    discipline: '💪 Discipline',
    longevity: '🏅 Longévité',
    technical: '🔧 Technique',
    quality: '✨ Qualité',
    attitude: '😊 Attitude',
    custom: '🎁 Spécial',
  }

  return (
    <TouchableOpacity style={styles.badgeItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.badgeIcon}>
        <Text style={styles.emoji}>{badge.icon_emoji}</Text>
      </View>

      <View style={styles.badgeContent}>
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription} numberOfLines={2}>
          {badge.description}
        </Text>
        <View style={styles.badgeFooter}>
          <Text style={styles.badgeCategory}>{categoryLabels[badge.category] || badge.category}</Text>
          {badge.points > 0 && (
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={12} color={colors.primary[500]} />
              <Text style={styles.pointsText}>+{badge.points}</Text>
            </View>
          )}
        </View>
      </View>

      {badge.is_unlocked && (
        <View style={styles.unlockedBadge}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
        </View>
      )}
    </TouchableOpacity>
  )
}

export const BadgesList: React.FC<BadgesListProps> = ({ badges, isLoading }) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null)
  const unlockedBadges = badges.filter(b => b.is_unlocked)

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    )
  }

  if (unlockedBadges.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="trophy-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyTitle}>Aucun badge reçu</Text>
        <Text style={styles.emptySubtitle}>Complète des défis pour débloquer des badges!</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Badges Reçus</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{unlockedBadges.length}</Text>
        </View>
      </View>

      <FlatList
        data={unlockedBadges}
        renderItem={({ item }) => (
          <BadgeItem badge={item} onPress={() => setSelectedBadge(item)} />
        )}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        visible={selectedBadge !== null}
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  badgeCount: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    gap: spacing.md,
  },
  badgeItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  emoji: {
    fontSize: 32,
  },
  badgeContent: {
    flex: 1,
  },
  badgeName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badgeDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  badgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeCategory: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  unlockedBadge: {
    marginLeft: spacing.sm,
    flexShrink: 0,
  },
  loadingContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
})
