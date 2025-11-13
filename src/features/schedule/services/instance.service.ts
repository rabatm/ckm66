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
      // Query all course instances (now includes both regular and one-time courses)
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

      // Apply filters
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

      // Enrich instances with correct reservation counts and available_spots
      const enrichedInstances: CourseInstanceWithDetails[] = await Promise.all(
        (instances || []).map(async (instance) => {
          const { course, instructor, ...instanceWithoutCourse } = instance

          // Get actual count of confirmed reservations from database
          const { count: actualConfirmedCount, error: countError } = await supabase
            .from('reservations')
            .select('id', { count: 'exact', head: true })
            .eq('course_instance_id', instance.id)
            .eq('status', 'confirmed')

          if (countError) {
            console.error(`Error counting reservations for instance ${instance.id}:`, countError)
          }

          const confirmedCount = actualConfirmedCount || 0
          const availableSpots = instance.max_capacity - confirmedCount

          const result = {
            ...instanceWithoutCourse,
            status: instance.status as InstanceStatus,
            is_exceptional: instance.is_exceptional || false,
            is_one_time: instance.is_one_time || false,
            current_reservations: confirmedCount, // Override with actual count
            available_spots: availableSpots,
            is_full: availableSpots <= 0,
          } as CourseInstanceWithDetails

          if (course) {
            result.course = course
          }
          if (instructor && typeof instructor === 'object' && 'id' in instructor) {
            result.instructor = instructor as {
              id: string
              first_name: string
              last_name: string
              profile_picture_url: string | null
            }
          }
          return result as CourseInstanceWithDetails
        })
      )

      // Enrich all instances with user reservations if userId provided
      const enrichedInstancesWithReservations: CourseInstanceWithDetails[] = await Promise.all(
        enrichedInstances.map(async (instance) => {
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
        return enrichedInstancesWithReservations.filter((instance) => !instance.is_full)
      }

      return enrichedInstancesWithReservations
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

      // Get actual count of confirmed reservations
      const { count: actualConfirmedCount, error: countError } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('course_instance_id', instanceId)
        .eq('status', 'confirmed')

      if (countError) {
        console.error(`Error counting reservations for instance ${instanceId}:`, countError)
      }

      const confirmedCount = actualConfirmedCount || 0

      // Use one_time_max_participants if it's a one-time course
      const maxCapacity =
        (instance as { is_one_time?: boolean }).is_one_time &&
        (instance as { one_time_max_participants?: number | null }).one_time_max_participants !==
          null
          ? (instance as { one_time_max_participants: number }).one_time_max_participants
          : instance.max_capacity

      const availableSpots = maxCapacity - confirmedCount

      const result = {
        ...instance,
        current_reservations: confirmedCount, // Override with actual count
        available_spots: availableSpots,
        is_full: availableSpots <= 0,
      }

      // Remove course if it's null
      if (!instance.course) {
        const resultWithoutCourse = Object.fromEntries(
          Object.entries(result).filter(([key]) => key !== 'course')
        )
        return resultWithoutCourse as unknown as CourseInstanceWithDetails
      }

      return result as unknown as CourseInstanceWithDetails
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
  ): Promise<{ id: string; status: string; waiting_list_position?: number | null } | null> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, status, waiting_list_position')
        .eq('user_id', userId)
        .eq('course_instance_id', instanceId)
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
  static async getInstanceReservations(instanceId: string) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          `
          *,
          user:user_id(id, first_name, last_name, email, profile_picture_url)
        `
        )
        .eq('course_instance_id', instanceId)
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
  static async generateAllInstances(weeksAhead: number = 4) {
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
