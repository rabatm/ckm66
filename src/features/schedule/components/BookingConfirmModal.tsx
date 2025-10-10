import React from 'react'
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import type { Course, SubscriptionRow } from '../types'
import { getDayName, formatTimeRange } from '../types'

interface BookingConfirmModalProps {
  visible: boolean
  course: Course | null
  subscription: SubscriptionRow | null
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function BookingConfirmModal({
  visible,
  course,
  subscription,
  isLoading = false,
  onConfirm,
  onClose,
}: BookingConfirmModalProps) {
  if (!course) return null

  const isFull = course.is_full || false
  const isSessionPack = subscription?.type.includes('session_pack')
  const remainingSessions = subscription?.remaining_sessions || 0

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons
              name={isFull ? 'time' : 'checkmark-circle'}
              size={32}
              color={isFull ? colors.secondary[500] : colors.success}
            />
            <Text style={styles.title}>
              {isFull ? "Rejoindre la liste d'attente" : 'Confirmer la réservation'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={styles.courseDetails}>
              <View style={styles.courseDetailRow}>
                <Ionicons name="calendar" size={16} color={colors.text.tertiary} />
                <Text style={styles.courseDetailText}>
                  {course.day_of_week ? getDayName(course.day_of_week) : 'Jour non défini'}
                </Text>
              </View>
              <View style={styles.courseDetailRow}>
                <Ionicons name="time" size={16} color={colors.text.tertiary} />
                <Text style={styles.courseDetailText}>
                  {formatTimeRange(course.start_time, course.end_time)}
                </Text>
              </View>
              <View style={styles.courseDetailRow}>
                <Ionicons name="location" size={16} color={colors.text.tertiary} />
                <Text style={styles.courseDetailText}>{course.location}</Text>
              </View>
            </View>
          </View>

          {/* Subscription Info */}
          {isSessionPack && (
            <View style={styles.subscriptionInfo}>
              <View style={styles.subscriptionRow}>
                <View style={styles.subscriptionLeft}>
                  <Ionicons name="ticket" size={20} color={colors.secondary[500]} />
                  <Text style={styles.subscriptionText}>
                    {isFull ? 'Aucune' : '1'} séance sera déduite
                  </Text>
                </View>
                <Text style={styles.subscriptionValue}>
                  {remainingSessions} → {isFull ? remainingSessions : remainingSessions - 1}
                </Text>
              </View>
              {!isFull && remainingSessions <= 3 && (
                <View style={styles.warningBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.secondary[500]} />
                  <Text style={styles.warningText}>
                    {remainingSessions === 1
                      ? 'Dernière séance disponible'
                      : `Plus que ${remainingSessions - 1} séance${remainingSessions > 2 ? 's' : ''} après cette réservation`}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Waiting List Info */}
          {isFull && (
            <View style={styles.waitingListInfo}>
              <Ionicons name="information-circle" size={20} color={colors.secondary[500]} />
              <Text style={styles.waitingListText}>
                Le cours est complet. Vous serez ajouté à la liste d'attente et automatiquement
                inscrit si une place se libère.
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
              onPress={onConfirm}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.confirmButtonText}>{isFull ? 'Rejoindre' : 'Confirmer'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  courseInfo: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  courseTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  courseDetails: {
    gap: spacing.sm,
  },
  courseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  courseDetailText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  subscriptionInfo: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subscriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  subscriptionValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.secondary[500],
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary[500],
    borderRadius: 8,
  },
  warningText: {
    fontSize: typography.sizes.xs,
    color: colors.secondary[500],
    flex: 1,
  },
  waitingListInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary[500],
  },
  waitingListText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
})
