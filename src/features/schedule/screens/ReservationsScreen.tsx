import React from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, typography } from '@/theme'
import { useReservationsGrouped } from '../hooks'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ReservationService } from '../services'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const ReservationsScreen = () => {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const { data: reservations, isLoading, error } = useReservationsGrouped(user?.id || '')

  // Helper function to get course title
  const getCourseTitle = (reservation: any) => {
    // For one-time courses, title is in reservation.course
    if (reservation.course?.title) {
      return reservation.course.title
    }
    // For regular courses, title is in reservation.course_instance.course
    if (reservation.course_instance?.course?.title) {
      return reservation.course_instance.course.title
    }
    // For one-time courses stored in course_instance
    if (reservation.course_instance?.one_time_title) {
      return reservation.course_instance.one_time_title
    }
    return 'Titre inconnu'
  }

  // Helper function to get course time
  const getCourseTime = (reservation: any) => {
    // For one-time courses, time is in reservation.course
    if (reservation.course?.start_time && reservation.course?.end_time) {
      return `${reservation.course.start_time} - ${reservation.course.end_time}`
    }
    // For regular courses, time is in reservation.course_instance
    if (reservation.course_instance?.start_time && reservation.course_instance?.end_time) {
      return `${reservation.course_instance.start_time} - ${reservation.course_instance.end_time}`
    }
    return null
  }

  // Mutation for cancelling reservations
  const queryClient = useQueryClient()
  const cancelMutation = useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: string; reason: string }) =>
      ReservationService.cancelReservation({
        reservation_id: reservationId,
        cancellation_reason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', user?.id] })
    },
  })

  const handleCancelReservation = (reservation: any) => {
    Alert.alert(
      'Annuler la réservation',
      'Attention ! Si vous annulez votre réservation, vous devrez contacter le coach pour vous réinscrire. Voulez-vous continuer ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate({
              reservationId: reservation.id,
              reason: "Annulation par l'utilisateur",
            })
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Chargement des réservations...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Erreur lors du chargement des réservations</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom + 120, spacing['5xl'] + 60),
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary[500]} />
            <Text style={styles.title}>Mes réservations</Text>
          </View>
          <Text style={styles.subtitle}>Gérez vos cours réservés</Text>
        </View>

        {/* Upcoming Reservations */}
        {reservations?.upcoming && reservations.upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes réservations</Text>
            {reservations.upcoming.map((reservation) => (
              <View key={reservation.id} style={styles.reservationItem}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.courseTitle}>{getCourseTitle(reservation)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Confirmée</Text>
                  </View>
                </View>
                <Text style={styles.reservationDate}>
                  {reservation.reservation_date
                    ? new Date(reservation.reservation_date).toLocaleDateString('fr-FR')
                    : 'Date inconnue'}
                </Text>
                {getCourseTime(reservation) && (
                  <Text style={styles.reservationTime}>{getCourseTime(reservation)}</Text>
                )}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelReservation(reservation)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* No reservations */}
        {!reservations?.upcoming?.length && (
          <View style={styles.centerContent}>
            <Ionicons name="calendar" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptyText}>Vous n'avez pas encore de réservations à venir</Text>
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.dark,
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  reservationItem: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  courseTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pastBadge: {
    backgroundColor: colors.text.tertiary,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  reservationDate: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    marginBottom: 2,
  },
  reservationTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  cancelButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorDetail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
