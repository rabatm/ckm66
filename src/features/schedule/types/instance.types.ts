/**
 * Course Instance Types
 * Types for specific dated occurrences of recurring courses
 */

export interface CourseInstance {
  id: string
  course_id: string | null // Nullable for one-time courses
  instance_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  max_capacity: number
  current_reservations: number
  instructor_id: string | null
  backup_instructor_id: string | null
  location: string
  status: InstanceStatus
  cancellation_reason: string | null
  is_exceptional: boolean // Legacy field
  is_one_time: boolean // True for standalone one-time courses
  one_time_title: string | null // Title for one-time courses
  one_time_description: string | null // Description for one-time courses
  one_time_max_participants: number | null // Max participants for one-time courses
  notes: string | null
  created_at: string
  updated_at: string
}

export type InstanceStatus = 'scheduled' | 'cancelled' | 'completed'

export interface CourseInstanceWithDetails extends CourseInstance {
  course?: {
    id: string
    title: string
    description: string | null
    level: string | null
  }
  instructor?: {
    id: string
    first_name: string
    last_name: string
    profile_picture_url: string | null
  } | null
  available_spots?: number
  is_full?: boolean
  user_reservation?: {
    id: string
    status: string
    waiting_list_position?: number | null
  } | null
}

export interface RecurrencePattern {
  days: number[] // 0-6, where 0 = Sunday
  frequency: 'weekly' | 'biweekly' | 'monthly'
}

export interface CourseWithRecurrence {
  id: string
  title: string
  description: string | null
  recurrence_pattern: RecurrencePattern
  recurrence_start: string | null
  recurrence_end: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  max_capacity: number
  instructor_id: string | null
  location: string
  is_recurring: boolean
  is_active: boolean
}

export interface InstanceFilters {
  courseId?: string
  startDate?: string
  endDate?: string
  status?: InstanceStatus
  location?: string
  availableOnly?: boolean
}

export const groupInstancesByDate = (
  instances: CourseInstanceWithDetails[]
): Map<string, CourseInstanceWithDetails[]> => {
  const grouped = new Map<string, CourseInstanceWithDetails[]>()

  instances.forEach((instance) => {
    const dateKey = instance.instance_date
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(instance)
  })

  return grouped
}

export const groupInstancesByWeek = (
  instances: CourseInstanceWithDetails[]
): Map<string, CourseInstanceWithDetails[]> => {
  const grouped = new Map<string, CourseInstanceWithDetails[]>()

  instances.forEach((instance) => {
    const date = new Date(instance.instance_date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0]!

    if (!grouped.has(weekKey)) {
      grouped.set(weekKey, [])
    }
    grouped.get(weekKey)!.push(instance)
  })

  return grouped
}

export const formatInstanceDateTime = (instance: CourseInstance): string => {
  const date = new Date(instance.instance_date)
  const [hours, minutes] = instance.start_time.split(':')

  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dateStr = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = `${hours}h${minutes !== '00' ? minutes : ''}`

  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateStr} à ${timeStr}`
}

/**
 * Get the display title for an instance (handles both regular and one-time courses)
 */
export const getInstanceTitle = (instance: CourseInstanceWithDetails): string => {
  if (instance.is_one_time && instance.one_time_title) {
    return instance.one_time_title
  }
  return instance.course?.title || 'Cours sans titre'
}

/**
 * Get the display description for an instance (handles both regular and one-time courses)
 */
export const getInstanceDescription = (instance: CourseInstanceWithDetails): string | null => {
  if (instance.is_one_time) {
    return instance.one_time_description
  }
  return instance.course?.description || null
}

/**
 * Get the max capacity for an instance (handles both regular and one-time courses)
 */
export const getInstanceMaxCapacity = (instance: CourseInstance): number => {
  if (instance.is_one_time && instance.one_time_max_participants !== null) {
    return instance.one_time_max_participants
  }
  return instance.max_capacity
}

/**
 * Check if an instance is a one-time course
 */
export const isOneTimeCourse = (instance: CourseInstance): boolean => {
  return instance.is_one_time === true
}
