import { useQuery } from '@tanstack/react-query'
import { InstanceService } from '../services'
import type { InstanceFilters } from '../types'

/**
 * useInstances Hook
 * Fetches and caches course instances with optional filtering
 */

export const INSTANCES_QUERY_KEY = 'instances'

export function useInstances(filters?: InstanceFilters, userId?: string) {
  return useQuery({
    queryKey: [INSTANCES_QUERY_KEY, filters, userId],
    queryFn: () => InstanceService.getInstances(filters, userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * useInstance Hook
 * Fetches a single instance by ID
 */

export function useInstance(instanceId: string) {
  return useQuery({
    queryKey: [INSTANCES_QUERY_KEY, instanceId],
    queryFn: () => InstanceService.getInstanceById(instanceId),
    enabled: !!instanceId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * useInstanceReservations Hook
 * Fetches reservations for a specific instance
 */

export function useInstanceReservations(instanceId: string) {
  return useQuery({
    queryKey: [INSTANCES_QUERY_KEY, instanceId, 'reservations'],
    queryFn: () => InstanceService.getInstanceReservations(instanceId),
    enabled: !!instanceId,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * useUpcomingInstances Hook
 * Fetches upcoming instances (next 2 weeks)
 */

export function useUpcomingInstances(userId?: string, daysAhead: number = 14) {
  return useQuery({
    queryKey: [INSTANCES_QUERY_KEY, 'upcoming', daysAhead, userId],
    queryFn: () => InstanceService.getUpcomingInstances(userId, daysAhead),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
