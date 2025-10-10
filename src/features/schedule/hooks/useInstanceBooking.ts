import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import {
  ReservationService,
  type CreateInstanceReservationData,
  type CancelInstanceReservationData,
} from '../services/reservation.service'
import { INSTANCES_QUERY_KEY } from './useInstances'
import { RESERVATIONS_QUERY_KEY } from './useReservations'

/**
 * useInstanceBooking Hook
 * Handles course instance booking with optimistic updates and error handling
 */

export function useInstanceBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInstanceReservationData) => {
      // Validate booking first
      const validation = await ReservationService.validateBooking(
        data.user_id,
        data.course_instance_id
      )

      if (!validation.canBook) {
        throw new Error(validation.error || 'Impossible de réserver ce cours')
      }

      // Create reservation
      return ReservationService.createReservation(data)
    },
    onSuccess: (reservation) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [INSTANCES_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS_QUERY_KEY] })

      const isWaitingList = reservation.status === 'waiting_list'

      Alert.alert(
        'Succès',
        isWaitingList
          ? `Vous êtes en liste d'attente (position ${reservation.waiting_list_position})`
          : 'Réservation confirmée !'
      )
    },
    onError: (error: any) => {
      console.error('Booking error:', error)
      Alert.alert('Erreur', error.message || 'Impossible de réserver ce cours')
    },
  })
}

/**
 * useCancelInstanceBooking Hook
 * Handles instance reservation cancellation with refund logic
 */

export function useCancelInstanceBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CancelInstanceReservationData) => {
      return ReservationService.cancelReservation(data)
    },
    onSuccess: (reservation) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [INSTANCES_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [RESERVATIONS_QUERY_KEY] })

      const refundMessage =
        reservation.refund_amount && reservation.refund_amount > 0
          ? ` ${reservation.refund_amount} séance${reservation.refund_amount > 1 ? 's' : ''} remboursée${reservation.refund_amount > 1 ? 's' : ''}.`
          : ''

      Alert.alert('Annulation confirmée', `Votre réservation a été annulée.${refundMessage}`)
    },
    onError: (error: any) => {
      console.error('Cancellation error:', error)
      Alert.alert('Erreur', error.message || "Impossible d'annuler la réservation")
    },
  })
}

/**
 * useValidateInstanceBooking Hook
 * Validates if a user can book an instance without making the booking
 */

export function useValidateInstanceBooking() {
  return useMutation({
    mutationFn: ({ userId, instanceId }: { userId: string; instanceId: string }) => {
      return ReservationService.validateBooking(userId, instanceId)
    },
  })
}
