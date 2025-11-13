import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { DarkCard } from '@/components/ui'
import { colors, spacing, typography } from '@/theme'
import type { CourseInstanceWithDetails } from '../types'
import { formatTimeRange } from '../types'
import { StudentsListModal } from './StudentsListModal'
import { useInstanceReservations } from '../hooks'

interface InstanceCardProps {
  instance: CourseInstanceWithDetails
  onBook?: () => void
  onCancel?: () => void
  onViewDetails?: () => void
  showActions?: boolean
  showDate?: boolean
  isInstructor?: boolean
}

export function InstanceCard({
  instance,
  onBook,
  onCancel,
  onViewDetails,
  showActions = true,
  showDate = true,
  isInstructor = false,
}: InstanceCardProps) {
  const [showStudentsModal, setShowStudentsModal] = useState(false)

  // Get confirmed students count for instructors
  const { data: allReservations } = useInstanceReservations(isInstructor ? instance.id : '')

  const confirmedStudentsCount = useMemo(() => {
    if (!allReservations) return 0
    return allReservations.filter((res: any) => res.status === 'confirmed').length
  }, [allReservations])

  const maxCapacity = instance.max_capacity || 0

  // Calculate available spots based on confirmed reservations only
  const currentReservations = instance.current_reservations || 0
  const availableSpots = Math.max(maxCapacity - currentReservations, 0)

  const isFull = availableSpots <= 0
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0
  const userReservation = instance.user_reservation

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

    if (userReservation.status === 'cancelled') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
          <Ionicons name="close-circle" size={14} color={colors.text.primary} />
          <View>
            <Text style={styles.statusBadgeText}>Annulé</Text>
            <Text style={styles.statusBadgeSubText}>
              Si vous voulez vous inscrire, contacter le coach
            </Text>
          </View>
        </View>
      )
    }

    return null
  }

  const formatDate = () => {
    const date = new Date(instance.instance_date)
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    })

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateStr}`
  }

  return (
    <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7} disabled={!onViewDetails}>
      <DarkCard style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {instance.is_one_time
                ? instance.one_time_title || 'Cours ponctuel'
                : instance.course?.title || 'Cours sans titre'}
            </Text>
            {instance.is_one_time && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>⚡ Cours ponctuel</Text>
              </View>
            )}
            {showDate && <Text style={styles.date}>{formatDate()}</Text>}
            {getStatusBadge()}
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={colors.text.tertiary} />
            <Text style={styles.infoText}>
              {formatTimeRange(instance.start_time, instance.end_time)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={colors.text.tertiary} />
            <Text style={styles.infoText}>{instance.location}</Text>
          </View>

          {instance.instructor && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={colors.text.tertiary} />
              <Text style={styles.infoText}>
                {instance.instructor.first_name} {instance.instructor.last_name}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        {showActions && (
          <View style={styles.footer}>
            {isInstructor ? (
              // Instructor View: Show students button with count
              <TouchableOpacity
                style={[styles.actionButton, styles.studentsButton]}
                onPress={() => setShowStudentsModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="people" size={16} color={colors.primary[500]} />
                <Text style={styles.studentsButtonText}>
                  Voir les élèves inscrits ({confirmedStudentsCount}/{maxCapacity})
                </Text>
              </TouchableOpacity>
            ) : (
              // Student View: Show spots and book/cancel buttons
              <>
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

                {userReservation && userReservation.status !== 'cancelled' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Annuler</Text>
                  </TouchableOpacity>
                ) : !userReservation ? (
                  <TouchableOpacity
                    style={[styles.actionButton, isFull && styles.waitlistButton]}
                    onPress={onBook}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      {isFull ? "Liste d'attente" : 'Réserver'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        )}

        {/* Students List Modal */}
        {isInstructor && (
          <StudentsListModal
            visible={showStudentsModal}
            courseInstanceId={instance.id}
            courseName={
              instance.is_one_time
                ? instance.one_time_title || 'Cours ponctuel'
                : instance.course?.title || 'Cours'
            }
            onClose={() => setShowStudentsModal(false)}
          />
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
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
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
  statusBadgeSubText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    opacity: 0.8,
    marginTop: 2,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fbbf24',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
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
  studentsButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.primary[500],
    gap: spacing.sm,
    justifyContent: 'center',
  },
  studentsButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
})
