import React, { useMemo } from 'react'
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import type { UserLevel } from '@/features/profile/types/badge.types'
import { LEVELS } from '@/features/profile/types/badge.types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNextReservation } from '@/features/schedule/hooks/useNextReservation'
import { useBadges } from '@/features/profile/hooks/useBadges'
import { formatTimeRange, getDayName } from '@/features/schedule/types/course.types'
import type { Reservation } from '@/features/schedule/types/reservation.types'

interface DarkAppHeaderProps {
  firstName?: string
  profilePictureUrl?: string | null
  level?: UserLevel
  totalPoints?: number
  onReservationPress?: () => void
  onBadgesPress?: () => void
}

/**
 * Utility functions for formatting reservation data
 */

const getDateLabel = (date: Date): string => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui"
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Demain'
  }
  return `${getDayName(date.getDay())} ${date.getDate()}`
}

const getReservationTimeRange = (reservation: Reservation): string => {
  // Priority: course_instance times > course times
  if (reservation.course_instance?.start_time && reservation.course_instance?.end_time) {
    return formatTimeRange(
      reservation.course_instance.start_time,
      reservation.course_instance.end_time
    )
  }

  if (reservation.course?.start_time && reservation.course?.end_time) {
    return formatTimeRange(reservation.course.start_time, reservation.course.end_time)
  }

  return 'Heure inconnue'
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
  onReservationPress,
  onBadgesPress,
}) => {
  const { user } = useAuth()
  const { nextReservation } = useNextReservation(user?.id || '')
  const { badges, userProgress } = useBadges()
  const levelInfo = LEVELS[level]

  // Get the most recent badge unlocked
  const lastBadge = useMemo(() => {
    const unlockedBadges = badges
      .filter((badge) => badge.is_unlocked && badge.unlocked_at)
      .sort((a, b) => {
        const dateA = new Date(a.unlocked_at!).getTime()
        const dateB = new Date(b.unlocked_at!).getTime()
        return dateB - dateA
      })
    return unlockedBadges[0] || null
  }, [badges])

  // Memoized formatted next reservation info
  const nextReservationText = useMemo(() => {
    if (
      !nextReservation?.reservation_date &&
      !nextReservation?.course?.one_time_date &&
      !nextReservation?.course_instance?.instance_date
    ) {
      return 'Aucune réservation'
    }

    // Get the appropriate date for this reservation
    const reservationDate = nextReservation.reservation_date
      ? new Date(nextReservation.reservation_date)
      : nextReservation.course?.one_time_date
        ? new Date(nextReservation.course.one_time_date)
        : nextReservation.course_instance?.instance_date
          ? new Date(nextReservation.course_instance.instance_date)
          : new Date()

    const dateLabel = getDateLabel(reservationDate)
    const courseTitle =
      nextReservation.course?.title ||
      (nextReservation.course_instance as { course?: { title: string } })?.course?.title ||
      nextReservation.course_instance?.one_time_title ||
      'Cours'
    const timeRange = getReservationTimeRange(nextReservation)

    return `${dateLabel} - ${courseTitle} ${timeRange}`
  }, [nextReservation])

  // Memoized badges progress text
  const badgesProgressText = useMemo(() => {
    if (!userProgress) {
      return { unlocked: 0, total: 0, percentage: 0 }
    }
    return {
      unlocked: userProgress.unlocked_badges,
      total: userProgress.total_badges,
      percentage: userProgress.badges_percentage,
    }
  }, [userProgress])

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(185, 28, 28, 0.08)', 'rgba(26, 32, 44, 0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profilePictureUrl ? (
                <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              {/* Level indicator badge on avatar */}
              <View style={[styles.levelBadge, { backgroundColor: levelInfo.color }]}>
                <Text style={styles.levelBadgeText}>{level}</Text>
              </View>
            </View>

            {/* User info */}
            <View style={styles.userInfo}>
              <Text style={styles.name}>{firstName}</Text>
              <View style={styles.levelContainer}>
                <View style={[styles.levelDot, { backgroundColor: levelInfo.color }]} />
                <Text style={styles.levelText}>{levelInfo.title}</Text>
                <Text style={styles.pointsText}>• {totalPoints} pts</Text>
              </View>
            </View>

            {/* Last Badge Display */}
            {lastBadge && (
              <View style={styles.lastBadgeContainer}>
                <Text style={styles.lastBadgeEmoji}>{lastBadge.icon_emoji}</Text>
                <Text style={styles.lastBadgePoints}>+{lastBadge.points}</Text>
              </View>
            )}
          </View>

          {/* Next Reservation - Clickable Priority Action */}
          <TouchableOpacity
            style={[
              styles.nextReservationCard,
              {
                backgroundColor:
                  Platform.OS === 'ios' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)',
                borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
              },
            ]}
            onPress={onReservationPress}
            activeOpacity={0.7}
            disabled={!onReservationPress || !nextReservation}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Prochaine réservation</Text>
                <Text style={styles.cardValue} numberOfLines={1}>
                  {nextReservationText}
                </Text>
              </View>
              {onReservationPress && nextReservation && (
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
              )}
            </View>
          </TouchableOpacity>

          {/* Badges Card - Clickable Navigation to Profile/Badges */}
          <TouchableOpacity
            style={[
              styles.badgesCard,
              {
                backgroundColor:
                  Platform.OS === 'ios'
                    ? 'rgba(251, 146, 60, 0.1)'
                    : 'rgba(251, 146, 60, 0.15)',
                borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
                borderColor: 'rgba(251, 146, 60, 0.4)',
              },
            ]}
            onPress={onBadgesPress}
            activeOpacity={0.7}
            disabled={!onBadgesPress}
          >
            <View style={styles.badgesContent}>
              <View style={styles.badgesHeader}>
                <Ionicons name="trophy-outline" size={18} color="#FB923C" />
                <Text style={styles.badgesTitle}>Badges</Text>
              </View>
              <Text style={styles.badgesValue}>
                {badgesProgressText.unlocked}/{badgesProgressText.total} Débloqués
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${badgesProgressText.percentage}%`,
                      backgroundColor: '#FB923C',
                    },
                  ]}
                />
              </View>
            </View>
            {onBadgesPress && (
              <Ionicons name="chevron-forward" size={20} color="#FB923C" />
            )}
          </TouchableOpacity>
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
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderLeftWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderRightWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: 'rgba(185, 28, 28, 0.2)',
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    paddingBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  levelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  // Last Badge Display (in header)
  lastBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: 'rgba(185, 28, 28, 0.3)',
  },
  lastBadgeEmoji: {
    fontSize: 24,
  },
  lastBadgePoints: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    marginTop: 2,
  },
  // Next Reservation Card - Priority Action
  nextReservationCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  // Badges Card - Tab Effect Navigation
  badgesCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#FB923C',
  },
  badgesContent: {
    flex: 1,
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  badgesTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  badgesValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
})
