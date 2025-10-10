import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { globalStyles, colors } from '@/theme'
import type { BadgeWithProgress } from '../types/badge.types'
import { LEVELS } from '../types/badge.types'
import { useBadges } from '../hooks/useBadges'
import { BadgeIcon } from '@/components/ui/BadgeIcon'

export function AccomplissementsScreen() {
  const { userProgress, isLoading, error, filterByCategory } = useBadges()
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  const filteredBadges = filterByCategory('all')
  const myBadges = filteredBadges.filter((badge) => badge.is_unlocked)

  const handleBadgePress = (badge: BadgeWithProgress) => {
    setSelectedBadge(badge)
    setShowBadgeModal(true)
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={globalStyles.loadingText}>Chargement de vos accomplissements...</Text>
      </View>
    )
  }

  // Show error state
  if (error) {
    return (
      <View style={globalStyles.loadingContainer}>
        <View style={globalStyles.errorBanner}>
          <Ionicons name="alert-circle" size={24} color={colors.error[500]} />
          <Text style={globalStyles.errorBannerText}>{error}</Text>
        </View>
      </View>
    )
  }

  // Show empty state
  if (!userProgress) {
    return (
      <View style={globalStyles.loadingContainer}>
        <View style={globalStyles.emptyCard}>
          <Text style={globalStyles.emptyText}>Aucune donnée disponible</Text>
        </View>
      </View>
    )
  }

  const levelInfo = LEVELS[userProgress.current_level]
  const progressPercentage = userProgress.badges_percentage
  const levelProgress = userProgress.progress_percentage

  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollView}>
        {/* Level & Progress Section */}
        <View style={globalStyles.section}>
          <View style={globalStyles.card}>
            <Text style={styles.cardTitle}>Niveau & Progression</Text>

            <View style={styles.levelInfo}>
              <Text style={[styles.levelTitle, { color: levelInfo.color }]}>
                Niveau {userProgress.current_level} - {levelInfo.title}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${levelProgress}%`, backgroundColor: levelInfo.color },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {userProgress.total_points} /{' '}
                {userProgress.next_level_info?.min_points || userProgress.total_points} pts
              </Text>
              {userProgress.next_level_info && (
                <Text style={styles.motivationText}>
                  Plus que {userProgress.points_to_next_level} pts pour passer{' '}
                  {userProgress.next_level_info.title} !
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.badgesSummary}>
              <Text style={styles.badgesSummaryTitle}>
                {userProgress.unlocked_badges}/{userProgress.total_badges} badges débloqués
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>{progressPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Badges List */}
        <View style={globalStyles.section}>
          {myBadges.length === 0 ? (
            <View style={styles.emptyBadges}>
              <Ionicons name="medal" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyBadgesText}>Aucun badge débloqué</Text>
              <Text style={styles.emptyBadgesSubtext}>
                Continue tes efforts pour gagner tes premiers badges !
              </Text>
            </View>
          ) : (
            myBadges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={styles.badgeCard}
                onPress={() => handleBadgePress(badge)}
                activeOpacity={0.7}
              >
                <View style={styles.badgeCardLeft}>
                  <View style={styles.badgeIcon}>
                    <BadgeIcon badgeCode={badge.code} size={24} color={colors.secondary[500]} />
                  </View>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>

                    {badge.coach_name && (
                      <View style={styles.badgeCoachContainer}>
                        <Ionicons name="person" size={14} color={colors.text.tertiary} />
                        <Text style={styles.badgeCoach}>Attribué par {badge.coach_name}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.badgeCardRight}>
                  <View style={styles.badgePoints}>
                    <Text style={styles.badgePointsText}>{badge.points} pts</Text>
                  </View>
                  <Text style={styles.unlockedDate}>
                    {new Date(badge.unlocked_at!).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Modal
          visible={showBadgeModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowBadgeModal(false)}
        >
          <View style={globalStyles.modalOverlay}>
            <View style={globalStyles.modalContainer}>
              <View style={globalStyles.modalHeader}>
                <Text style={globalStyles.modalTitle}>Détails du Badge</Text>
                <TouchableOpacity
                  onPress={() => setShowBadgeModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBadge}>
                <View
                  style={[
                    styles.modalBadgeIcon,
                    !selectedBadge.is_unlocked && styles.badgeIconLocked,
                  ]}
                >
                  {selectedBadge.is_unlocked ? (
                    <BadgeIcon
                      badgeCode={selectedBadge.code}
                      size={48}
                      color={colors.secondary[500]}
                    />
                  ) : (
                    <Ionicons name="lock-closed" size={40} color={colors.text.disabled} />
                  )}
                </View>
                <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                <Text style={styles.modalBadgePoints}>{selectedBadge.points} points</Text>
                <Text style={styles.modalBadgeDescription}>{selectedBadge.description}</Text>
              </View>

              {selectedBadge.is_unlocked ? (
                <View style={styles.modalUnlockedInfo}>
                  <View style={styles.modalUnlockedTitleContainer}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.modalUnlockedTitle}>Badge débloqué</Text>
                  </View>
                  <Text style={styles.modalUnlockedDate}>
                    Le{' '}
                    {new Date(selectedBadge.unlocked_at!).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  {selectedBadge.coach_name && (
                    <>
                      <View style={styles.modalCoachContainer}>
                        <Ionicons name="person" size={16} color={colors.secondary[500]} />
                        <Text style={styles.modalCoach}>
                          Attribué par {selectedBadge.coach_name}
                        </Text>
                      </View>
                      {selectedBadge.coach_message && (
                        <View style={styles.modalCoachMessage}>
                          <Text style={styles.modalCoachMessageText}>
                            "{selectedBadge.coach_message}"
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.modalLockedInfo}>
                  <View style={styles.modalLockedTitleContainer}>
                    <Ionicons name="lock-closed" size={20} color={colors.error} />
                    <Text style={styles.modalLockedTitle}>Badge verrouillé</Text>
                  </View>
                  {selectedBadge.progress ? (
                    <>
                      <Text style={styles.modalProgressLabel}>Progression</Text>
                      <View style={styles.modalProgressBar}>
                        <View
                          style={[
                            styles.modalProgressFill,
                            { width: `${selectedBadge.progress.percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.modalProgressText}>
                        {selectedBadge.progress.current} / {selectedBadge.progress.required}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.modalLockedMessage}>
                      Ce badge sera attribué par ton coach
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBadgeModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  emptyBadges: {
    padding: 32,
    alignItems: 'center',
  },
  emptyBadgesText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  emptyBadgesSubtext: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.dark,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[500], // Rouge pour les titres principaux
    marginBottom: 16,
  },
  levelInfo: {
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.dark,
    marginVertical: 16,
  },
  badgesSummary: {},
  badgesSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary, // Blanc pour meilleure lisibilité
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingRight: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.dark,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.text.primary,
  },
  badgeCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.dark,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(185, 28, 28, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  badgeIconLocked: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.light,
  },
  badgeIconText: {
    fontSize: 28,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: colors.text.tertiary,
  },
  badgeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  badgeCoachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  badgeCoach: {
    fontSize: 12,
    color: colors.secondary[500],
    fontWeight: '500',
  },
  badgeProgress: {
    marginTop: 8,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  badgeCardRight: {
    alignItems: 'flex-end',
  },
  badgePoints: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.secondary[500],
  },
  badgePointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary[500],
  },
  unlockedDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary[500],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: colors.text.secondary,
    lineHeight: 32,
  },
  modalBadge: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(185, 28, 28, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  modalBadgeIconText: {
    fontSize: 40,
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  modalBadgePoints: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary[500],
    marginBottom: 12,
  },
  modalBadgeDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalUnlockedInfo: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.success,
  },
  modalUnlockedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalUnlockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  modalUnlockedDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  modalCoachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalCoach: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary[500],
  },
  modalCoachMessage: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  modalCoachMessageText: {
    fontSize: 14,
    color: colors.text.primary,
    fontStyle: 'italic',
  },
  modalLockedInfo: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalLockedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalLockedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  modalProgressLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  modalProgressBar: {
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 6,
  },
  modalProgressText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalLockedMessage: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: colors.primary[500],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
})
