import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native'
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { colors, spacing, typography } from '@/theme'
import {
  useInstances,
  useInstanceBooking,
  useCancelInstanceBooking,
  useReservations,
} from '../hooks'
import { InstanceCard, BookingConfirmModal, WeekNavigator } from '../components'
import type { CourseInstanceWithDetails } from '../types'
import { useSubscription } from '@/features/profile/hooks/useSubscription'

export const ScheduleScreen = () => {
  const { user } = useAuth()
  const [selectedInstance, setSelectedInstance] = useState<CourseInstanceWithDetails | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showReservationsModal, setShowReservationsModal] = useState(false)

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek) // Start on Sunday
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  })

  // Calculate week range for data fetching
  const weekRange = useMemo(() => {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    return {
      startDate: currentWeekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
    }
  }, [currentWeekStart])

  // Hooks
  const {
    data: instances,
    isLoading,
    error,
    refetch,
  } = useInstances(
    {
      startDate: weekRange.startDate!,
      endDate: weekRange.endDate!,
    },
    user?.id
  )
  const { subscriptionInfo } = useSubscription()
  const bookingMutation = useInstanceBooking()
  const cancelMutation = useCancelInstanceBooking()
  const { data: reservations } = useReservations(user?.id || '')

  const totalReservations = reservations?.length || 0

  const isRefreshing = isLoading

  // Sort and group instances
  const allInstances = useMemo(() => {
    if (!instances) return []

    const now = new Date()

    // Filter out past instances and sort by date then time
    return [...instances]
      .filter((instance) => {
        const instanceDateTime = new Date(`${instance.instance_date}T${instance.start_time}`)
        return instanceDateTime > now
      })
      .sort((a, b) => {
        const dateCompare = a.instance_date.localeCompare(b.instance_date)
        if (dateCompare !== 0) return dateCompare
        return a.start_time.localeCompare(b.start_time)
      })
  }, [instances])

  // Week navigation handlers
  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newWeekStart)
  }

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newWeekStart)
  }

  // Handlers
  const handleBookInstance = (instance: CourseInstanceWithDetails) => {
    if (!user?.id || !subscriptionInfo?.subscription) {
      Alert.alert('Erreur', 'Vous devez avoir un abonnement actif pour réserver un cours')
      return
    }

    setSelectedInstance(instance)
    setShowBookingModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!user?.id || !selectedInstance || !subscriptionInfo?.subscription) return

    try {
      await bookingMutation.mutateAsync({
        user_id: user.id,
        course_instance_id: selectedInstance.id,
        subscription_id: subscriptionInfo.subscription.id,
      })

      setShowBookingModal(false)
      setSelectedInstance(null)
    } catch (error) {
      console.error('Booking error:', error)
    }
  }

  const handleCancelReservation = (instance: CourseInstanceWithDetails) => {
    if (!instance.user_reservation) return

    const reservation = instance.user_reservation

    Alert.alert('Annuler la réservation', 'Êtes-vous sûr de vouloir annuler cette réservation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation.mutateAsync({
              reservation_id: reservation.id,
              cancellation_reason: "Annulation par l'utilisateur",
            })
          } catch (error) {
            console.error('Cancellation error:', error)
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Week Navigator */}
        <View style={styles.section}>
          <WeekNavigator
            weekStart={currentWeekStart}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
          />
        </View>

        {/* Loading / Error States */}
        {isLoading && !instances ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Chargement de la semaine...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Impossible de charger les cours. Tirez pour actualiser.
            </Text>
          </View>
        ) : (
          <>
            {/* All Courses */}
            <View style={styles.section}>
              {allInstances.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <SimpleLineIcons
                    name="calendar"
                    size={48}
                    color={colors.text.tertiary}
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.emptyTitle}>Aucun cours disponible</Text>
                  <Text style={styles.emptyText}>
                    Il n'y a pas de cours disponibles cette semaine
                  </Text>
                </View>
              ) : (
                allInstances.map((instance) => (
                  <InstanceCard
                    key={instance.id}
                    instance={instance}
                    {...(instance.user_reservation ? { onCancel: () => handleCancelReservation(instance) } : { onBook: () => handleBookInstance(instance) })}
                    showDate={true}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Menu */}
      <View style={styles.bottomMenu}>
        <View style={styles.bottomMenuContainer}>
          {/* Planning Tab */}
          <TouchableOpacity style={styles.bottomMenuItem} activeOpacity={0.7}>
            <Ionicons name="calendar" size={24} color={colors.primary[500]} />
            <Text style={[styles.bottomMenuItemText, { color: colors.primary[500] }]}>
              Cours
            </Text>
          </TouchableOpacity>

          {/* Badges Tab */}
          <TouchableOpacity style={styles.bottomMenuItem} activeOpacity={0.7}>
            <Ionicons name="medal" size={24} color={colors.text.secondary} />
            <Text style={styles.bottomMenuItemText}>Badges</Text>
          </TouchableOpacity>

          {/* Reservations Tab */}
          <TouchableOpacity
            style={styles.bottomMenuItem}
            onPress={() => setShowReservationsModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.reservationIconContainer}>
              <Ionicons name="list" size={24} color={colors.text.secondary} />
              {totalReservations > 0 && (
                <View style={styles.reservationBadge}>
                  <Text style={styles.reservationBadgeText}>{totalReservations}</Text>
                </View>
              )}
            </View>
            <Text style={styles.bottomMenuItemText}>Réservations</Text>
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity style={styles.bottomMenuItem} activeOpacity={0.7}>
            <Ionicons name="person" size={24} color={colors.text.secondary} />
            <Text style={styles.bottomMenuItemText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reservations Modal */}
      <Modal
        visible={showReservationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReservationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mes réservations</Text>
            <TouchableOpacity
              onPress={() => setShowReservationsModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.emptyReservations}>
              <Text style={styles.emptyReservationsText}>Fonctionnalité en développement</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Booking Confirmation Modal */}
      <BookingConfirmModal
        visible={showBookingModal}
        course={
          selectedInstance
            ? ({
                id: selectedInstance.id,
                title: selectedInstance.course?.title || '',
                day_of_week: new Date(selectedInstance.instance_date).getDay(),
                start_time: selectedInstance.start_time,
                end_time: selectedInstance.end_time,
                location: selectedInstance.location,
                max_capacity: selectedInstance.max_capacity,
                current_reservations: selectedInstance.current_reservations,
                is_full: selectedInstance.is_full,
              } as any)
            : null
        }
        subscription={subscriptionInfo?.subscription || null}
        isLoading={bookingMutation.isPending}
        onConfirm={handleConfirmBooking}
        onClose={() => {
          setShowBookingModal(false)
          setSelectedInstance(null)
        }}
      />
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
  scrollContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  errorContainer: {
    margin: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bottomMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomMenuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 80,
  },
  bottomMenuItemText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  reservationIconContainer: {
    position: 'relative',
  },
  reservationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.secondary[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalContent: {
    flex: 1,
  },
  reservationSection: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  reservationSectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    marginBottom: spacing.md,
  },
  reservationItem: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  reservationTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  reservationDate: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    marginBottom: 2,
  },
  reservationLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  reservationStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.success,
  },
  emptyReservations: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyReservationsText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
