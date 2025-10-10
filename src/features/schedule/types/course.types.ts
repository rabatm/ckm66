import type { Tables } from '../../../@types/database.types'

/**
 * Course Types
 * Types for course management and scheduling
 */

export type CourseRow = Tables<'courses'>
export type ProfileRow = Tables<'profiles'>

export interface Course extends CourseRow {
  instructor?: ProfileRow
  backup_instructor?: ProfileRow
  available_spots?: number
  is_full?: boolean
  user_reservation?: CourseUserReservation | null
}

export interface CourseUserReservation {
  id: string
  status: ReservationStatus
  reservation_date: string
  waiting_list_position?: number | null
}

export type ReservationStatus = 'confirmed' | 'waiting_list' | 'cancelled' | 'completed'

export interface CourseFilters {
  dayOfWeek?: number
  location?: string
  instructorId?: string
  availableOnly?: boolean
  includeFull?: boolean
  searchQuery?: string
}

export interface CourseWithReservations extends Course {
  reservations_count: number
  waiting_list_count: number
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche', short: 'Dim' },
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
] as const

export const getDayName = (dayOfWeek: number, short = false): string => {
  const day = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)
  return day ? (short ? day.short : day.label) : 'Inconnu'
}

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  return `${hours}h${minutes !== '00' ? minutes : ''}`
}

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}
