import { useQuery } from '@tanstack/react-query'
import { ReservationService } from '../services'
import { groupReservationsByStatus } from '../types'

/**
 * useReservations Hook
 * Fetches and caches user's reservations
 */

export const RESERVATIONS_QUERY_KEY = 'reservations'

export function useReservations(userId: string) {
  return useQuery({
    queryKey: [RESERVATIONS_QUERY_KEY, userId],
    queryFn: () => ReservationService.getUserReservations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * useReservationsGrouped Hook
 * Returns reservations grouped by status (upcoming, past, cancelled, waiting_list)
 */

export function useReservationsGrouped(userId: string) {
  const { data, ...rest } = useReservations(userId)

  const grouped = data ? groupReservationsByStatus(data) : null

  return {
    ...rest,
    data: grouped,
    upcoming: grouped?.upcoming || [],
    past: grouped?.past || [],
    cancelled: grouped?.cancelled || [],
    waitingList: grouped?.waiting_list || [],
  }
}
