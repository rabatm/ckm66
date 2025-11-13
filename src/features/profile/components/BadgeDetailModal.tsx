import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import type { BadgeWithProgress } from '../services/badge.service'

interface BadgeDetailModalProps {
  visible: boolean
  badge: BadgeWithProgress | null
  onClose: () => void
}

export function BadgeDetailModal({ visible, badge, onClose }: BadgeDetailModalProps) {
  if (!badge) return null

  const categoryLabels: Record<string, string> = {
    assiduity: 'Assiduité',
    presence: 'Présence',
    punctuality: 'Ponctualité',
    discipline: 'Discipline',
    longevity: 'Longévité',
    technical: 'Technique',
    quality: 'Qualité',
    attitude: 'Attitude',
    custom: 'Spécial',
  }

  const categoryEmojis: Record<string, string> = {
    assiduity: '📊',
    presence: '🎯',
    punctuality: '⏰',
    discipline: '💪',
    longevity: '🏅',
    technical: '🔧',
    quality: '✨',
    attitude: '😊',
    custom: '🎁',
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du Badge</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Badge Icon - Large */}
          <View style={styles.iconContainer}>
            <Text style={styles.largeIcon}>{badge.icon_emoji}</Text>
          </View>

          {/* Badge Name */}
          <Text style={styles.badgeName}>{badge.name}</Text>

          {/* Badge Status */}
          {badge.is_unlocked ? (
            <View style={[styles.statusBadge, styles.unlockedStatus]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.statusText, { color: colors.success }]}>Débloqué</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.lockedStatus]}>
              <Ionicons name="lock-closed" size={16} color={colors.text.tertiary} />
              <Text style={[styles.statusText, { color: colors.text.tertiary }]}>Verrouillé</Text>
            </View>
          )}

          {/* Category and Points */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Catégorie</Text>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryEmoji}>{categoryEmojis[badge.category] || '🎁'}</Text>
                <Text style={styles.categoryName}>{categoryLabels[badge.category] || badge.category}</Text>
              </View>
            </View>

            {badge.points > 0 && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Points</Text>
                <View style={styles.pointsTag}>
                  <Ionicons name="star" size={16} color={colors.primary[500]} />
                  <Text style={styles.pointsValue}>+{badge.points}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{badge.description}</Text>
          </View>

          {/* Unlock Condition */}
          {!badge.is_unlocked && badge.unlock_condition && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comment débloquer?</Text>
              <View style={styles.conditionBox}>
                <Ionicons name="bulb-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.conditionText}>{badge.unlock_condition}</Text>
              </View>
            </View>
          )}

          {/* Unlock Date */}
          {badge.is_unlocked && badge.unlocked_at && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Débloqué le</Text>
              <Text style={styles.unlockedDate}>
                {new Date(badge.unlocked_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  largeIcon: {
    fontSize: 64,
  },
  badgeName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignSelf: 'center',
  },
  unlockedStatus: {
    backgroundColor: `${colors.success}15`,
  },
  lockedStatus: {
    backgroundColor: `${colors.text.tertiary}15`,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  metaContainer: {
    gap: spacing.md,
  },
  metaItem: {
    gap: spacing.sm,
  },
  metaLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  pointsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.primary[500]}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  pointsValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  conditionBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  conditionText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  unlockedDate: {
    fontSize: typography.sizes.base,
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  closeButtonBottom: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
})
