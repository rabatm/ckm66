import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getSubscriptionInfo } from '../services/subscription.service'
import type { SubscriptionInfo } from '../types/profile.types'

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSubscription = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const info = await getSubscriptionInfo(user.id)
      setSubscriptionInfo(info)
    } catch (err) {
      console.error('Error loading subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscription()
  }, [user?.id])

  return {
    subscriptionInfo,
    isLoading,
    error,
    refetch: loadSubscription,
  }
}
