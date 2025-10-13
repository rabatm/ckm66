import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native'
import { SimpleLineIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { colors, spacing, typography } from '@/theme'
import { useInstances, useInstanceBooking, useCancelInstanceBooking } from '../hooks'
import { InstanceCard, BookingConfirmModal, WeekNavigator } from '../components'
import type { CourseInstanceWithDetails } from '../types'
import { useSubscription } from '@/features/profile/hooks/useSubscription'
import { addEventToCalendar, createCalendarEventFromReservation } from '@/utils/calendarUtils'
import type { Course } from '../types'

export const ScheduleScreen = () => {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [selectedInstance, setSelectedInstance] = useState<CourseInstanceWithDetails | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

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
    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour réserver un cours')
      return
    }

    // For non-guests, check if they have a subscription
    if (user.role !== 'guest' && !subscriptionInfo?.subscription) {
      Alert.alert('Erreur', 'Vous devez avoir un abonnement actif pour réserver un cours')
      return
    }

    setSelectedInstance(instance)
    setShowBookingModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!user?.id || !selectedInstance) return

    try {
      await bookingMutation.mutateAsync({
        user_id: user.id,
        course_instance_id: selectedInstance.id,
        subscription_id: user.role === 'guest' ? null : subscriptionInfo?.subscription?.id || null,
      })

      // Add event to calendar after successful booking
      const courseTitle = selectedInstance.course?.title || 'Cours'
      const calendarEvent = createCalendarEventFromReservation(
        courseTitle,
        selectedInstance.instance_date,
        selectedInstance.start_time,
        selectedInstance.end_time,
        selectedInstance.location
      )
      await addEventToCalendar(calendarEvent)

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
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom + 120, spacing['5xl'] + 60),
        }}
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
        <View style={styles.weekNavigatorContainer}>
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
                    {...(instance.user_reservation
                      ? { onCancel: () => handleCancelReservation(instance) }
                      : { onBook: () => handleBookInstance(instance) })}
                    showDate={true}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

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
              } as Course)
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
  weekNavigatorContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
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
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
