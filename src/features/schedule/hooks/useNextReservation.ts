import { useMemo } from 'react'
import { useReservationsGrouped } from './useReservations'

/**
 * useNextReservation Hook
 * Returns the next upcoming reservation for the user
 */

export function useNextReservation(userId: string) {
  const { upcoming, isLoading, error } = useReservationsGrouped(userId)

  const nextReservation = useMemo(() => {
    if (!upcoming || upcoming.length === 0) return null

    // Sort by reservation date and find the earliest upcoming one
    const sorted = upcoming
      .filter((reservation) => {
        // For regular course instances, use reservation_date
        if (reservation.reservation_date) return true

        // For one-time courses, check if course has one_time_date
        if (reservation.course?.one_time_date) return true

        // For course instances, check if course_instance has instance_date
        if (reservation.course_instance?.instance_date) return true

        return false
      })
      .sort((a, b) => {
        // Get date for reservation A
        const dateA = a.reservation_date
          ? new Date(a.reservation_date)
          : a.course?.one_time_date
            ? new Date(a.course.one_time_date)
            : a.course_instance?.instance_date
              ? new Date(a.course_instance.instance_date)
              : new Date()

        // Get date for reservation B
        const dateB = b.reservation_date
          ? new Date(b.reservation_date)
          : b.course?.one_time_date
            ? new Date(b.course.one_time_date)
            : b.course_instance?.instance_date
              ? new Date(b.course_instance.instance_date)
              : new Date()

        return dateA.getTime() - dateB.getTime()
      })

    return sorted[0] || null
  }, [upcoming])

  return {
    nextReservation,
    isLoading,
    error,
  }
}
