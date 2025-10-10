import type { Tables } from '../../../@types/database.types'
import type { Course, ReservationStatus } from './course.types'

/**
 * Reservation Types
 * Types for managing course reservations and bookings
 */

export type ReservationRow = Tables<'reservations'>
export type SubscriptionRow = Tables<'subscriptions'>

export interface Reservation extends ReservationRow {
  course?: Course
  subscription?: SubscriptionRow
}

export interface CreateReservationData {
  user_id: string
  course_id: string
  subscription_id: string
}

export interface CancelReservationData {
  reservation_id: string
  cancellation_reason: string
}

export interface BookingValidation {
  canBook: boolean
  error?: string
  subscription?: SubscriptionRow
  requiresPayment?: boolean
}

export interface ReservationGroup {
  upcoming: Reservation[]
  past: Reservation[]
  cancelled: Reservation[]
  waiting_list: Reservation[]
}

export const groupReservationsByStatus = (reservations: Reservation[]): ReservationGroup => {
  const now = new Date()

  return reservations.reduce(
    (acc, reservation) => {
      if (reservation.status === 'cancelled') {
        acc.cancelled.push(reservation)
      } else if (reservation.status === 'waiting_list') {
        acc.waiting_list.push(reservation)
      } else {
        const reservationDate = reservation.reservation_date
          ? new Date(reservation.reservation_date)
          : new Date()

        if (reservationDate < now) {
          acc.past.push(reservation)
        } else {
          acc.upcoming.push(reservation)
        }
      }
      return acc
    },
    { upcoming: [], past: [], cancelled: [], waiting_list: [] } as ReservationGroup
  )
}

export const calculateRefundAmount = (reservation: Reservation, courseStartTime: Date): number => {
  const now = new Date()
  const hoursUntilCourse = (courseStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  // Politique de remboursement : minimum 2h avant le cours
  const CANCELLATION_HOURS_THRESHOLD = 2

  if (hoursUntilCourse >= CANCELLATION_HOURS_THRESHOLD) {
    return reservation.sessions_deducted || 0
  }

  return 0
}

export const canCancelReservation = (
  reservation: Reservation,
  courseStartTime: Date
): { canCancel: boolean; reason?: string } => {
  if (reservation.status === 'cancelled') {
    return { canCancel: false, reason: 'Réservation déjà annulée' }
  }

  if (reservation.status === 'completed') {
    return { canCancel: false, reason: 'Le cours est terminé' }
  }

  const now = new Date()
  if (courseStartTime < now) {
    return { canCancel: false, reason: 'Le cours a déjà commencé' }
  }

  return { canCancel: true }
}
