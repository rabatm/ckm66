import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DarkCard } from '@/components/ui'
import { colors, spacing, typography } from '@/theme'
import type { Course } from '../types'
import { getDayName, formatTimeRange } from '../types'

interface CourseCardProps {
  course: Course
  onBook?: () => void
  onCancel?: () => void
  onViewDetails?: () => void
  showActions?: boolean
}

export function CourseCard({
  course,
  onBook,
  onCancel,
  onViewDetails,
  showActions = true,
}: CourseCardProps) {
  const availableSpots = course.available_spots || 0
  const isFull = course.is_full || false
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0
  const userReservation = course.user_reservation

  const getSpotsColor = () => {
    if (isFull) return colors.error
    if (isAlmostFull) return colors.secondary[500]
    return colors.success
  }

  const getStatusBadge = () => {
    if (!userReservation) return null

    if (userReservation.status === 'confirmed') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark-circle" size={14} color={colors.text.primary} />
          <Text style={styles.statusBadgeText}>Inscrit</Text>
        </View>
      )
    }

    if (userReservation.status === 'waiting_list') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.secondary[500] }]}>
          <Ionicons name="time" size={14} color={colors.text.primary} />
          <Text style={styles.statusBadgeText}>
            Liste d'attente #{userReservation.waiting_list_position}
          </Text>
        </View>
      )
    }

    return null
  }

  return (
    <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7} disabled={!onViewDetails}>
      <DarkCard style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {course.title}
            </Text>
            {getStatusBadge()}
          </View>
          <View style={styles.dayBadge}>
            <Text style={styles.dayText}>
              {course.day_of_week ? getDayName(course.day_of_week, true) : '?'}
            </Text>
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={colors.text.tertiary} />
            <Text style={styles.infoText}>
              {formatTimeRange(course.start_time, course.end_time)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={colors.text.tertiary} />
            <Text style={styles.infoText}>{course.location}</Text>
          </View>

          {course.instructor && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={colors.text.tertiary} />
              <Text style={styles.infoText}>
                {course.instructor.first_name} {course.instructor.last_name}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        {showActions && (
          <View style={styles.footer}>
            <View style={styles.spotsContainer}>
              <Ionicons
                name={isFull ? 'close-circle' : 'people'}
                size={16}
                color={getSpotsColor()}
              />
              <Text style={[styles.spotsText, { color: getSpotsColor() }]}>
                {isFull ? 'Complet' : `${availableSpots} place${availableSpots > 1 ? 's' : ''}`}
              </Text>
            </View>

            {userReservation ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionButtonText, { color: colors.error }]}>Annuler</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, isFull && styles.waitlistButton]}
                onPress={onBook}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>
                  {isFull ? "Liste d'attente" : 'Réserver'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </DarkCard>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  dayBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  dayText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  info: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  spotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  spotsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  actionButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  waitlistButton: {
    backgroundColor: colors.secondary[500],
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
})
