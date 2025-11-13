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
  subscription_id?: string | null // Make optional for guests
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
      // 1. Get user profile to check role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role, free_trials_remaining')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // 2. Check if user is a guest with free trials
      if (userProfile?.role === 'guest') {
        if (!userProfile.free_trials_remaining || userProfile.free_trials_remaining <= 0) {
          return {
            canBook: false,
            error: "Vous n'avez plus d'essais gratuits disponibles.",
          }
        }
        // For guests, skip subscription validation and go to other checks
      } else {
        // For non-guests, check subscription
        const subscription = await this.getActiveSubscription(userId)

        if (!subscription) {
          return {
            canBook: false,
            error: 'Aucun abonnement actif. Veuillez souscrire à un abonnement.',
          }
        }

        console.log('✅ Found active subscription:', subscription.id)
        // 3. Check expiration
        if (new Date(subscription.end_date) < new Date()) {
          return {
            canBook: false,
            error: 'Votre abonnement a expiré.',
          }
        }

        // 4. Check subscription status
        if (subscription.status !== 'active') {
          return {
            canBook: false,
            error: "Votre abonnement n'est pas actif.",
          }
        }

        // 5. Check remaining sessions for session packs
        if (subscription.type.includes('session_pack')) {
          if (!subscription.remaining_sessions || subscription.remaining_sessions <= 0) {
            return {
              canBook: false,
              error: "Vous n'avez plus de séances disponibles. Renouvelez votre carnet.",
            }
          }
        }
      }

      // 6. Check for existing reservation for this instance/course
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

      // Return success with subscription for non-guests
      if (userProfile?.role !== 'guest') {
        const subscription = await this.getActiveSubscription(userId)
        return {
          canBook: true,
          subscription,
        }
      } else {
        return {
          canBook: true,
        }
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
      const { user_id, course_instance_id, subscription_id } = data // subscription_id is now optional

      // Get user profile to check role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user_id)
        .single()

      if (profileError) throw profileError

      const isGuest = userProfile?.role === 'guest'

      // Get instance details from course_instances table (now all courses have instances)
      const { data: instanceData, error: instanceError } = await supabase
        .from('course_instances')
        .select('*')
        .eq('id', course_instance_id)
        .single()

      if (instanceError || !instanceData) {
        throw new Error('Cours introuvable')
      }

      const instance = instanceData

      // Determine if instance is full
      const isInstanceFull = instance.current_reservations >= instance.max_capacity
      const status = isInstanceFull ? 'waiting_list' : 'confirmed'

      let subscription = null
      if (!isGuest && subscription_id) {
        // Get subscription for non-guests
        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', subscription_id)
          .single()

        if (subError) throw subError
        subscription = subscriptionData
      }

      // Prepare reservation data
      let sessionDeducted = false
      let sessionsDeducted = 0
      let isFreeTrial = false
      let waitingListPosition = null

      // Only deduct session if confirmed and not a guest
      if (status === 'confirmed') {
        if (isGuest) {
          // For guests, mark as free trial (trigger will handle decrementing)
          isFreeTrial = true
        } else if (subscription && subscription.type.includes('session_pack')) {
          // For non-guests with session packs, deduct session
          await this.decrementSession(subscription.id)
          sessionDeducted = true
          sessionsDeducted = 1
        }
      }

      // Get waiting list position if applicable
      if (status === 'waiting_list') {
        waitingListPosition = await this.getNextWaitingListPosition(course_instance_id)
      }

      // Create reservation - always use course_instance_id now
      const reservationData: Partial<Database['public']['Tables']['reservations']['Insert']> = {
        user_id,
        course_instance_id,
        subscription_id: isGuest ? null : subscription_id || null,
        status,
        session_deducted: sessionDeducted,
        sessions_deducted: sessionsDeducted,
        is_free_trial: isFreeTrial,
        reservation_date: instance.instance_date,
        reserved_at: status === 'confirmed' ? new Date().toISOString() : null,
        waiting_list_position: waitingListPosition,
      }

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select()
        .single()

      if (reservationError) throw reservationError

      // Increment reservations count if confirmed
      if (status === 'confirmed') {
        await this.incrementInstanceReservations(course_instance_id)
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

      // Get instance details
      const courseInstance = reservation.course_instance
      if (!courseInstance) {
        throw new Error('Cours introuvable')
      }

      const courseDate = courseInstance.instance_date
      const courseStartTime = courseInstance.start_time

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

      // Refund free trial if applicable (for confirmed free trial reservations)
      if (reservation.status === 'confirmed' && reservation.is_free_trial && reservation.user_id) {
        // Check cancellation timing (same logic as sessions)
        const instanceDateTime = new Date(`${courseDate}T${courseStartTime}`)
        const now = new Date()
        const hoursUntilCourse = (instanceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilCourse >= 2) {
          await this.refundFreeTrial(reservation.user_id)
        }
      }

      // Decrement reservations count if was confirmed
      if (reservation.status === 'confirmed' && reservation.course_instance_id) {
        await this.decrementInstanceReservations(reservation.course_instance_id)
        // Promote from waiting list
        await this.promoteFromWaitingList(reservation.course_instance_id)
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
      // First get reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(
          `
          id, user_id, course_id, course_instance_id, subscription_id, status,
          reservation_date, reserved_at, cancelled_at, cancellation_reason,
          session_deducted, sessions_deducted, refund_amount, promoted_at,
          attended, check_in_time, check_out_time, notes, created_at, updated_at,
          course_instance:course_instance_id(*,
            course:course_id(id, title, description, level)
          ),
          course:course_id(id, title, description, level, course_type, one_time_date, start_time, end_time, location)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (reservationsError) throw reservationsError

      // If we have reservations, get their subscriptions separately
      if (reservations && reservations.length > 0) {
        const subscriptionIds = reservations
          .map((r) => r.subscription_id)
          .filter((id) => id !== null && id !== undefined)

        if (subscriptionIds.length > 0) {
          const { data: subscriptions, error: subscriptionsError } = await supabase
            .from('subscriptions')
            .select('*')
            .in('id', subscriptionIds)

          if (subscriptionsError) {
            console.warn('Error fetching subscriptions:', subscriptionsError)
          }

          const subscriptionMap = new Map(subscriptions?.map((sub) => [sub.id, sub]) || [])

          return reservations.map((reservation) => ({
            ...reservation,
            course: reservation.course || undefined,
            course_instance: reservation.course_instance || undefined,
            subscription: reservation.subscription_id
              ? subscriptionMap.get(reservation.subscription_id) || undefined
              : undefined,
          })) as unknown as Reservation[]
        }
      }

      return (reservations || []).map((reservation) => ({
        ...reservation,
        course: reservation.course || undefined,
        course_instance: reservation.course_instance || undefined,
        subscription: undefined,
      })) as unknown as Reservation[]
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
      // Check for existing reservation in course_instances (now all courses use course_instance_id)
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
   * Refund free trial
   */
  private static async refundFreeTrial(userId: string): Promise<void> {
    try {
      // Get current free trials
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('free_trials_remaining')
        .eq('id', userId)
        .eq('role', 'guest')
        .single()

      if (fetchError) throw fetchError

      const newCount = (profile.free_trials_remaining || 0) + 1

      const { error } = await supabase
        .from('profiles')
        .update({ free_trials_remaining: newCount })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error refunding free trial:', error)
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
      const { data: waiting } = await supabase
        .from('reservations')
        .select('id, user_id, subscription_id, status, session_deducted, sessions_deducted')
        .eq('course_instance_id', instanceId)
        .eq('status', 'waiting_list')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!waiting) {
        // No one in waiting list
        return
      }

      // Get subscription separately
      let subscription = null
      if (waiting.subscription_id) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', waiting.subscription_id)
          .maybeSingle()
        subscription = subData
      }

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
      if (subscription?.type.includes('session_pack')) {
        await this.decrementSession(subscription.id)
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
      if (!instance) throw new Error('Instance not found')

      const newCount = (instance.current_reservations || 0) + 1

      const { error } = await supabase
        .from('course_instances')
        .update({ current_reservations: newCount })
        .eq('id', instanceId)

      if (error) {
        console.error('Error updating current_reservations:', error)
        throw error
      }
      console.log(`Successfully incremented reservations for instance ${instanceId} to ${newCount}`)
    } catch (error) {
      console.error('Error incrementing instance reservations:', error)
      throw error
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
      if (!instance) throw new Error('Instance not found')

      const newCount = Math.max((instance.current_reservations || 0) - 1, 0)

      const { error } = await supabase
        .from('course_instances')
        .update({ current_reservations: newCount })
        .eq('id', instanceId)

      if (error) {
        console.error('Error updating current_reservations:', error)
        throw error
      }
      console.log(`Successfully decremented reservations for instance ${instanceId} to ${newCount}`)
    } catch (error) {
      console.error('Error decrementing instance reservations:', error)
      throw error
    }
  }
}
