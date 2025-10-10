import { supabase } from '@/lib/supabase'
import type { Course, CourseFilters, CourseWithReservations } from '../types'

/**
 * Course Service
 * Handles all course-related API operations
 */

export class CourseService {
  /**
   * Get all active courses with optional filters
   */
  static async getCourses(filters?: CourseFilters, userId?: string): Promise<Course[]> {
    try {
      let query = supabase
        .from('courses')
        .select(
          `
          *,
          instructor:instructor_id(id, first_name, last_name, profile_picture_url),
          backup_instructor:backup_instructor_id(id, first_name, last_name)
        `
        )
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      // Apply filters
      if (filters?.dayOfWeek !== undefined) {
        query = query.eq('day_of_week', filters.dayOfWeek)
      }

      if (filters?.location) {
        query = query.eq('location', filters.location)
      }

      if (filters?.instructorId) {
        query = query.eq('instructor_id', filters.instructorId)
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        )
      }

      const { data: courses, error } = await query

      if (error) throw error

      // Enrich courses with computed fields
      const enrichedCourses: Course[] = await Promise.all(
        courses.map(async (course) => {
          const availableSpots = course.max_capacity - course.current_reservations
          const isFull = availableSpots <= 0

          // Get user's reservation for this course if userId provided
          let userReservation = null
          if (userId) {
            userReservation = await this.getUserReservationForCourse(userId, course.id)
          }

          return {
            ...course,
            available_spots: availableSpots,
            is_full: isFull,
            user_reservation: userReservation,
          }
        })
      )

      // Filter by availability if requested
      if (filters?.availableOnly) {
        return enrichedCourses.filter((course) => !course.is_full)
      }

      return enrichedCourses
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw error
    }
  }

  /**
   * Get a single course by ID
   */
  static async getCourseById(courseId: string): Promise<Course> {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .select(
          `
          *,
          instructor:instructor_id(id, first_name, last_name, profile_picture_url, email),
          backup_instructor:backup_instructor_id(id, first_name, last_name)
        `
        )
        .eq('id', courseId)
        .single()

      if (error) throw error

      const availableSpots = course.max_capacity - course.current_reservations

      return {
        ...course,
        available_spots: availableSpots,
        is_full: availableSpots <= 0,
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      throw error
    }
  }

  /**
   * Get user's reservation for a specific course
   */
  static async getUserReservationForCourse(userId: string, courseId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, status, reservation_date, waiting_list_position')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .in('status', ['confirmed', 'waiting_list'])
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user reservation:', error)
      return null
    }
  }

  /**
   * Get course reservations (for attendance list)
   */
  static async getCourseReservations(courseId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          `
          *,
          user:user_id(id, first_name, last_name, email, profile_picture_url)
        `
        )
        .eq('course_id', courseId)
        .in('status', ['confirmed', 'waiting_list'])
        .order('status', { ascending: true })
        .order('waiting_list_position', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching course reservations:', error)
      throw error
    }
  }

  /**
   * Get unique locations from courses
   */
  static async getLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('location')
        .eq('is_active', true)

      if (error) throw error

      const uniqueLocations = [
        ...new Set(data.map((course) => course.location).filter(Boolean)),
      ] as string[]

      return uniqueLocations.sort()
    } catch (error) {
      console.error('Error fetching locations:', error)
      return []
    }
  }

  /**
   * Increment course reservations count
   */
  static async incrementCourseReservations(courseId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_course_reservations', {
        course_id: courseId,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing course reservations:', error)
      throw error
    }
  }

  /**
   * Decrement course reservations count
   */
  static async decrementCourseReservations(courseId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('decrement_course_reservations', {
        course_id: courseId,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error decrementing course reservations:', error)
      throw error
    }
  }
}
