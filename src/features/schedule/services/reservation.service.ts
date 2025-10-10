import { supabase } from '@/lib/supabase'
import type { Reservation, BookingValidation, SubscriptionRow } from '../types'
import type { Database } from '../../../@types/database.types'

/**
 * Reservation Service (Updated for Instances)
 * Handles all reservation-related operations for course instances
 */

export interface CreateInstanceReservationData {
  user_id: string
  course_instance_id: string
  subscription_id: string
}

export interface CancelInstanceReservationData {
  reservation_id: string
  cancellation_reason: string
}

export class ReservationService {
  /**
   * Validate if user can book a course instance (works for both regular and one-time courses)
   */
  static async validateBooking(
    userId: string,
    instanceOrCourseId: string
  ): Promise<BookingValidation> {
    try {
      // 1. Get active subscription
      const subscription = await this.getActiveSubscription(userId)

      if (!subscription) {
        return {
          canBook: false,
          error: 'Aucun abonnement actif. Veuillez souscrire à un abonnement.',
        }
      }

      // 2. Check expiration
      if (new Date(subscription.end_date) < new Date()) {
        return {
          canBook: false,
          error: 'Votre abonnement a expiré.',
        }
      }

      // 3. Check subscription status
      if (subscription.status !== 'active') {
        return {
          canBook: false,
          error: "Votre abonnement n'est pas actif.",
        }
      }

      // 4. Check remaining sessions for session packs
      if (subscription.type.includes('session_pack')) {
        if (!subscription.remaining_sessions || subscription.remaining_sessions <= 0) {
          return {
            canBook: false,
            error: "Vous n'avez plus de séances disponibles. Renouvelez votre carnet.",
          }
        }
      }

      // 5. Check for existing reservation for this instance/course
      const existingReservation = await this.checkExistingReservation(userId, instanceOrCourseId)

      if (existingReservation) {
        const statusMessages = {
          confirmed: 'Vous êtes déjà inscrit à ce cours.',
          waiting_list: "Vous êtes déjà sur la liste d'attente pour ce cours.",
          completed: 'Vous avez déjà participé à ce cours.',
          cancelled:
            'Désolé, vous avez annulé votre réservation. Veuillez contacter le coach pour vous réinscrire.',
        }
        return {
          canBook: false,
          error:
            statusMessages[existingReservation.status as keyof typeof statusMessages] ||
            'Vous avez déjà une réservation pour ce cours.',
        }
      }

      return {
        canBook: true,
        subscription,
      }
    } catch (error) {
      console.error('Error validating booking:', error)
      return {
        canBook: false,
        error: 'Une erreur est survenue lors de la validation.',
      }
    }
  }

  /**
   * Create a new reservation for a course instance (works for both regular and one-time courses)
   */
  static async createReservation(data: CreateInstanceReservationData): Promise<Reservation> {
    try {
      const { user_id, course_instance_id, subscription_id } = data

      // First, try to get instance details from course_instances table
      let instance = null
      let isOneTimeCourse = false
      let courseId = null

      const { data: instanceData } = await supabase
        .from('course_instances')
        .select('*')
        .eq('id', course_instance_id)
        .maybeSingle()

      if (instanceData) {
        instance = instanceData
        isOneTimeCourse = instanceData.is_one_time || false
      } else {
        // Check if this is a one-time course ID from courses table
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', course_instance_id)
          .eq('course_type', 'one_time')
          .maybeSingle()

        if (courseData) {
          // This is a one-time course, create instance-like data from course
          instance = {
            id: courseData.id,
            course_id: courseData.id,
            instance_date: courseData.one_time_date!,
            start_time: courseData.start_time,
            end_time: courseData.end_time,
            duration_minutes: courseData.duration_minutes,
            max_capacity: courseData.max_capacity,
            current_reservations: courseData.current_reservations || 0,
            instructor_id: courseData.instructor_id,
            backup_instructor_id: courseData.backup_instructor_id,
            location: courseData.location,
            status: 'scheduled',
            cancellation_reason: null,
            is_exceptional: false,
            is_one_time: true,
            notes: null,
            created_at: courseData.created_at,
            updated_at: courseData.updated_at,
          }
          isOneTimeCourse = true
          courseId = courseData.id
        } else {
          throw new Error('Cours introuvable')
        }
      }

      // Determine if instance is full
      const isInstanceFull = instance.current_reservations >= instance.max_capacity
      const status = isInstanceFull ? 'waiting_list' : 'confirmed'

      // Get subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscription_id)
        .single()

      if (subError) throw subError

      // Prepare reservation data
      let sessionDeducted = false
      let sessionsDeducted = 0
      let waitingListPosition = null

      // Only deduct session if confirmed (not waiting list)
      if (status === 'confirmed' && subscription.type.includes('session_pack')) {
        await this.decrementSession(subscription_id)
        sessionDeducted = true
        sessionsDeducted = 1
      }

      // Get waiting list position if applicable
      if (status === 'waiting_list') {
        waitingListPosition = await this.getNextWaitingListPosition(course_instance_id)
      }

      // Create reservation
      const reservationData: Partial<Database['public']['Tables']['reservations']['Insert']> = {
        user_id,
        subscription_id,
        status,
        session_deducted: sessionDeducted,
        sessions_deducted: sessionsDeducted,
        reservation_date: instance.instance_date,
        reserved_at: status === 'confirmed' ? new Date().toISOString() : null,
        waiting_list_position: waitingListPosition,
      }

      // Set course_id or course_instance_id based on type
      if (isOneTimeCourse) {
        reservationData.course_id = courseId || course_instance_id
        reservationData.course_instance_id = null
      } else {
        reservationData.course_instance_id = course_instance_id
        reservationData.course_id = null
      }

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select()
        .single()

      if (reservationError) throw reservationError

      // Increment reservations count if confirmed
      if (status === 'confirmed') {
        if (isOneTimeCourse) {
          await this.incrementCourseReservations(course_instance_id)
        } else {
          await this.incrementInstanceReservations(course_instance_id)
        }
      }

      return reservation
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  /**
   * Cancel a reservation (works for both regular and one-time courses)
   */
  static async cancelReservation(data: CancelInstanceReservationData): Promise<Reservation> {
    try {
      const { reservation_id, cancellation_reason } = data

      // Get reservation details
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('*, course_instance:course_instance_id(*)')
        .eq('id', reservation_id)
        .single()

      if (reservationError) throw reservationError

      if (!reservation) {
        throw new Error('Réservation introuvable')
      }

      // Determine if this is a one-time course or regular instance
      let isOneTimeCourse = false
      let courseInstance = reservation.course_instance
      let courseDate: string | null = null
      let courseStartTime: string | null = null
      let instanceId = reservation.course_instance_id

      if (courseInstance) {
        // Regular course instance
        courseDate = courseInstance.instance_date
        courseStartTime = courseInstance.start_time
        isOneTimeCourse = courseInstance.is_one_time || false
      } else if (reservation.course_id) {
        // One-time course - get details from courses table
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', reservation.course_id)
          .eq('course_type', 'one_time')
          .single()

        if (courseError || !courseData) {
          throw new Error('Cours introuvable')
        }

        courseDate = courseData.one_time_date
        courseStartTime = courseData.start_time
        isOneTimeCourse = true
        instanceId = reservation.course_id // Use course_id as instance ID for one-time courses
      } else {
        throw new Error('Cours introuvable')
      }

      if (!courseDate || !courseStartTime) {
        throw new Error('Cours introuvable')
      }

      // Calculate refund (only for confirmed reservations)
      let refundAmount = 0
      if (reservation.status === 'confirmed' && reservation.sessions_deducted) {
        // Check cancellation timing (example: 2 hours before course)
        const instanceDateTime = new Date(`${courseDate}T${courseStartTime}`)
        const now = new Date()
        const hoursUntilCourse = (instanceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilCourse >= 2) {
          refundAmount = reservation.sessions_deducted
        }
      }

      // Update reservation
      const { data: updatedReservation, error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason,
          refund_amount: refundAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation_id)
        .select()
        .single()

      if (updateError) throw updateError

      // Refund sessions if applicable
      if (refundAmount > 0 && reservation.subscription_id) {
        await this.refundSessions(reservation.subscription_id, refundAmount)
      }

      // Decrement reservations count if was confirmed
      if (reservation.status === 'confirmed' && instanceId) {
        if (isOneTimeCourse) {
          await this.decrementCourseReservations(instanceId)
        } else {
          await this.decrementInstanceReservations(instanceId)
        }
        // Promote from waiting list
        await this.promoteFromWaitingList(instanceId)
      }

      return updatedReservation
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      throw error
    }
  }

  /**
   * Get user reservations
   */
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          `
          *,
          course_instance:course_instance_id(*,
            course:course_id(id, title, description, level)
          ),
          course:course_id(id, title, description, level, course_type, one_time_date, start_time, end_time, location),
          subscription:subscription_id(*)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []).map((reservation) => ({
        ...reservation,
        subscription: reservation.subscription || undefined,
      }))
    } catch (error) {
      console.error('Error fetching user reservations:', error)
      throw error
    }
  }

  /**
   * Get active subscription for user
   */
  private static async getActiveSubscription(userId: string): Promise<SubscriptionRow | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching active subscription:', error)
      return null
    }
  }

  /**
   * Check if user already has a reservation for this instance or course
   */
  private static async checkExistingReservation(
    userId: string,
    instanceOrCourseId: string
  ): Promise<{ id: string; status: string } | null> {
    try {
      // Check for existing reservation in course_instances
      const { data: instanceReservation } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('user_id', userId)
        .eq('course_instance_id', instanceOrCourseId)
        .in('status', ['confirmed', 'waiting_list', 'completed', 'cancelled'])
        .maybeSingle()

      if (instanceReservation) {
        return instanceReservation
      }

      // Check for existing reservation in courses (one-time courses)
      const { data: courseReservation } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('user_id', userId)
        .eq('course_id', instanceOrCourseId)
        .in('status', ['confirmed', 'waiting_list', 'completed', 'cancelled'])
        .maybeSingle()

      if (courseReservation) {
        return courseReservation
      }

      return null
    } catch (error) {
      console.error('Error checking existing reservation:', error)
      return null
    }
  }

  /**
   * Decrement remaining sessions
   */
  private static async decrementSession(subscriptionId: string): Promise<void> {
    try {
      // Get current remaining sessions
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('remaining_sessions')
        .eq('id', subscriptionId)
        .single()

      if (fetchError) throw fetchError

      const newCount = Math.max((subscription.remaining_sessions || 0) - 1, 0)

      const { error } = await supabase
        .from('subscriptions')
        .update({ remaining_sessions: newCount })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      console.error('Error decrementing session:', error)
      throw error
    }
  }

  /**
   * Refund sessions
   */
  private static async refundSessions(subscriptionId: string, amount: number): Promise<void> {
    try {
      // Get current remaining sessions
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('remaining_sessions')
        .eq('id', subscriptionId)
        .single()

      if (fetchError) throw fetchError

      const newCount = (subscription.remaining_sessions || 0) + amount

      const { error } = await supabase
        .from('subscriptions')
        .update({ remaining_sessions: newCount })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      console.error('Error refunding sessions:', error)
      throw error
    }
  }

  /**
   * Get next waiting list position
   */
  private static async getNextWaitingListPosition(instanceId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('waiting_list_position')
        .eq('course_instance_id', instanceId)
        .eq('status', 'waiting_list')
        .order('waiting_list_position', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return (data?.waiting_list_position || 0) + 1
    } catch (error) {
      console.error('Error getting next waiting list position:', error)
      return 1
    }
  }

  /**
   * Promote first person from waiting list
   */
  private static async promoteFromWaitingList(instanceId: string): Promise<void> {
    try {
      // Get first person in waiting list
      const { data: waiting, error } = await supabase
        .from('reservations')
        .select('*, subscription:subscription_id(*)')
        .eq('course_instance_id', instanceId)
        .eq('status', 'waiting_list')
        .order('waiting_list_position', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (error || !waiting) return

      // Validate their subscription is still valid
      if (!waiting.user_id) {
        // Remove from waiting list and try next
        await supabase
          .from('reservations')
          .update({ status: 'cancelled', cancellation_reason: 'Utilisateur invalide' })
          .eq('id', waiting.id)
        return this.promoteFromWaitingList(instanceId)
      }

      const validation = await this.validateBooking(waiting.user_id, instanceId)
      if (!validation.canBook) {
        // Remove from waiting list and try next
        await supabase
          .from('reservations')
          .update({ status: 'cancelled', cancellation_reason: 'Abonnement invalide' })
          .eq('id', waiting.id)
        return this.promoteFromWaitingList(instanceId)
      }

      // Deduct session if session pack
      let sessionDeducted = false
      let sessionsDeducted = 0
      if (waiting.subscription?.type.includes('session_pack')) {
        await this.decrementSession(waiting.subscription.id)
        sessionDeducted = true
        sessionsDeducted = 1
      }

      // Promote
      await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          promoted_at: new Date().toISOString(),
          reserved_at: new Date().toISOString(),
          session_deducted: sessionDeducted,
          sessions_deducted: sessionsDeducted,
          waiting_list_position: null,
        })
        .eq('id', waiting.id)

      // Increment instance reservations
      await this.incrementInstanceReservations(instanceId)

      // Update other waiting list positions
      await supabase.rpc('update_instance_waiting_list_positions', {
        instance_id: instanceId,
      })
    } catch (error) {
      console.error('Error promoting from waiting list:', error)
    }
  }

  /**
   * Increment course reservations (for one-time courses)
   */
  private static async incrementCourseReservations(courseId: string): Promise<void> {
    try {
      // Get current reservations count
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('current_reservations')
        .eq('id', courseId)
        .single()

      if (fetchError) throw fetchError

      const newCount = (course.current_reservations || 0) + 1

      const { error } = await supabase
        .from('courses')
        .update({ current_reservations: newCount })
        .eq('id', courseId)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing course reservations:', error)
    }
  }

  /**
   * Decrement course reservations (for one-time courses)
   */
  private static async decrementCourseReservations(courseId: string): Promise<void> {
    try {
      // Get current reservations count
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('current_reservations')
        .eq('id', courseId)
        .single()

      if (fetchError) throw fetchError

      const newCount = Math.max((course.current_reservations || 0) - 1, 0)

      const { error } = await supabase
        .from('courses')
        .update({ current_reservations: newCount })
        .eq('id', courseId)

      if (error) throw error
    } catch (error) {
      console.error('Error decrementing course reservations:', error)
    }
  }

  /**
   * Increment instance reservations
   */
  private static async incrementInstanceReservations(instanceId: string): Promise<void> {
    try {
      // Get current reservations count
      const { data: instance, error: fetchError } = await supabase
        .from('course_instances')
        .select('current_reservations')
        .eq('id', instanceId)
        .single()

      if (fetchError) throw fetchError

      const newCount = (instance.current_reservations || 0) + 1

      const { error } = await supabase
        .from('course_instances')
        .update({ current_reservations: newCount })
        .eq('id', instanceId)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing instance reservations:', error)
    }
  }

  /**
   * Decrement instance reservations
   */
  private static async decrementInstanceReservations(instanceId: string): Promise<void> {
    try {
      // Get current reservations count
      const { data: instance, error: fetchError } = await supabase
        .from('course_instances')
        .select('current_reservations')
        .eq('id', instanceId)
        .single()

      if (fetchError) throw fetchError

      const newCount = Math.max((instance.current_reservations || 0) - 1, 0)

      const { error } = await supabase
        .from('course_instances')
        .update({ current_reservations: newCount })
        .eq('id', instanceId)

      if (error) throw error
    } catch (error) {
      console.error('Error decrementing instance reservations:', error)
    }
  }
}
