import { supabase } from '@/lib/supabase'
import type { CourseInstanceWithDetails, InstanceFilters, InstanceStatus } from '../types'

/**
 * Instance Service
 * Handles all course instance operations (dated occurrences)
 */

export class InstanceService {
  /**
   * Get course instances with filters
   */
  static async getInstances(
    filters?: InstanceFilters,
    userId?: string
  ): Promise<CourseInstanceWithDetails[]> {
    try {
      // Query course_instances for recurring course instances
      let instancesQuery = supabase
        .from('course_instances')
        .select(
          `
          *,
          course:course_id(id, title, description, level),
          instructor:instructor_id(id, first_name, last_name, profile_picture_url)
        `
        )
        .eq('status', 'scheduled')
        .order('instance_date', { ascending: true })
        .order('start_time', { ascending: true })

      // Apply filters to instances
      if (filters?.courseId) {
        instancesQuery = instancesQuery.eq('course_id', filters.courseId)
      }

      if (filters?.startDate) {
        instancesQuery = instancesQuery.gte('instance_date', filters.startDate)
      }

      if (filters?.endDate) {
        instancesQuery = instancesQuery.lte('instance_date', filters.endDate)
      }

      if (filters?.location) {
        instancesQuery = instancesQuery.eq('location', filters.location)
      }

      if (filters?.status) {
        instancesQuery = instancesQuery.eq('status', filters.status)
      }

      const { data: instances, error: instancesError } = await instancesQuery

      if (instancesError) throw instancesError

      // Get one-time courses from courses table where course_type = 'one_time'
      let oneTimeCoursesQuery = supabase
        .from('courses')
        .select('*')
        .eq('course_type', 'one_time')
        .eq('is_active', true)

      // Apply date filters
      if (filters?.startDate) {
        oneTimeCoursesQuery = oneTimeCoursesQuery.gte('one_time_date', filters.startDate)
      }

      if (filters?.endDate) {
        oneTimeCoursesQuery = oneTimeCoursesQuery.lte('one_time_date', filters.endDate)
      }

      // Apply filters
      if (filters?.location) {
        oneTimeCoursesQuery = oneTimeCoursesQuery.ilike('location', `%${filters.location}%`)
      }

      const { data: oneTimeCourses, error: oneTimeError } = await oneTimeCoursesQuery

      if (oneTimeError) throw oneTimeError

      // Transform one-time courses to match CourseInstanceWithDetails interface
      const transformedOneTimeCourses: CourseInstanceWithDetails[] = (oneTimeCourses || []).map(
        (course) => ({
          id: course.id, // Use course ID as instance ID for one-time courses
          course_id: course.id,
          instance_date: course.one_time_date!,
          start_time: course.start_time,
          end_time: course.end_time,
          duration_minutes: course.duration_minutes,
          max_capacity: course.max_capacity,
          current_reservations: course.current_reservations || 0,
          instructor_id: course.instructor_id,
          backup_instructor_id: course.backup_instructor_id,
          location: course.location,
          status: 'scheduled' as InstanceStatus,
          cancellation_reason: null,
          is_exceptional: false,
          is_one_time: true,
          one_time_title: course.title,
          one_time_description: course.description,
          one_time_max_participants: course.max_capacity,
          notes: null,
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString(),
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            level: course.level,
          },
          instructor: null, // TODO: Fetch instructor data separately
          available_spots: course.max_capacity - (course.current_reservations || 0),
          is_full: (course.current_reservations || 0) >= course.max_capacity,
          user_reservation: null, // Will be set below if userId provided
        })
      )

      // Combine both types of instances
      const allInstances = [...(instances || []), ...transformedOneTimeCourses]

      // Enrich all instances with user reservations if userId provided
      const enrichedInstances: CourseInstanceWithDetails[] = await Promise.all(
        allInstances.map(async (instance) => {
          // Get user's reservation for this instance if userId provided
          let userReservation = null
          if (userId) {
            userReservation = await this.getUserReservationForInstance(userId, instance.id)
          }

          return {
            ...instance,
            user_reservation: userReservation,
          }
        })
      )

      // Filter by availability if requested
      if (filters?.availableOnly) {
        return enrichedInstances.filter((instance) => !instance.is_full)
      }

      return enrichedInstances
    } catch (error) {
      console.error('Error fetching instances:', error)
      throw error
    }
  }

  /**
   * Get a single instance by ID
   */
  static async getInstanceById(instanceId: string): Promise<CourseInstanceWithDetails> {
    try {
      const { data: instance, error } = await supabase
        .from('course_instances')
        .select(
          `
          *,
          course:course_id(id, title, description, level),
          instructor:instructor_id(id, first_name, last_name, profile_picture_url, email),
          is_one_time,
          one_time_title,
          one_time_description,
          one_time_max_participants
        `
        )
        .eq('id', instanceId)
        .single()

      if (error) throw error

      // Use one_time_max_participants if it's a one-time course
      const maxCapacity =
        (instance as any).is_one_time && (instance as any).one_time_max_participants !== null
          ? (instance as any).one_time_max_participants
          : instance.max_capacity

      const availableSpots = maxCapacity - instance.current_reservations

      return {
        ...instance,
        available_spots: availableSpots,
        is_full: availableSpots <= 0,
      }
    } catch (error) {
      console.error('Error fetching instance:', error)
      throw error
    }
  }

  /**
   * Get user's reservation for a specific instance
   */
  static async getUserReservationForInstance(
    userId: string,
    instanceId: string
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, status, waiting_list_position')
        .eq('user_id', userId)
        .or(`course_instance_id.eq.${instanceId},course_id.eq.${instanceId}`)
        .in('status', ['confirmed', 'waiting_list', 'cancelled'])
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user reservation:', error)
      return null
    }
  }

  /**
   * Get instance reservations (for attendance list)
   */
  static async getInstanceReservations(instanceId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          `
          *,
          user:user_id(id, first_name, last_name, email, profile_picture_url)
        `
        )
        .or(`course_instance_id.eq.${instanceId},course_id.eq.${instanceId}`)
        .in('status', ['confirmed', 'waiting_list'])
        .order('status', { ascending: true })
        .order('waiting_list_position', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching instance reservations:', error)
      throw error
    }
  }

  /**
   * Generate instances for a course
   */
  static async generateInstances(courseId: string, weeksAhead: number = 4): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('generate_course_instances', {
        p_course_id: courseId,
        p_weeks_ahead: weeksAhead,
      })

      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error generating instances:', error)
      throw error
    }
  }

  /**
   * Generate instances for all active courses
   */
  static async generateAllInstances(weeksAhead: number = 4): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('generate_all_course_instances', {
        p_weeks_ahead: weeksAhead,
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error generating all instances:', error)
      throw error
    }
  }

  /**
   * Cancel a specific course instance
   */
  static async cancelInstance(instanceId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_instances')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', instanceId)

      if (error) throw error

      // TODO: Notify all users with reservations and refund their sessions
    } catch (error) {
      console.error('Error cancelling instance:', error)
      throw error
    }
  }

  /**
   * Get upcoming instances (next 2 weeks by default)
   */
  static async getUpcomingInstances(
    userId?: string,
    daysAhead: number = 14
  ): Promise<CourseInstanceWithDetails[]> {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysAhead)
    const endDateStr = endDate.toISOString().split('T')[0]

    return this.getInstances(
      {
        startDate: today,
        endDate: endDateStr,
        status: 'scheduled' as InstanceStatus,
      } as InstanceFilters,
      userId
    )
  }

  /**
   * Increment instance reservations count
   */
  static async incrementInstanceReservations(instanceId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_instance_reservations', {
        instance_id: instanceId,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing instance reservations:', error)
      throw error
    }
  }

  /**
   * Decrement instance reservations count
   */
  static async decrementInstanceReservations(instanceId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('decrement_instance_reservations', {
        instance_id: instanceId,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error decrementing instance reservations:', error)
      throw error
    }
  }
}
