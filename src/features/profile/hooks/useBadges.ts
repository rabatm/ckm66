import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  fetchBadgesWithProgress,
  getUserProgress,
  type BadgeWithProgress,
  type UserProgress,
  type BadgeCategory,
} from '../services/badge.service'

export function useBadges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<BadgeWithProgress[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBadges = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Load badges and progress in parallel
      const [badgesData, progressData] = await Promise.all([
        fetchBadgesWithProgress(user.id),
        getUserProgress(user.id),
      ])

      setBadges(badgesData)
      setUserProgress(progressData)
    } catch (err) {
      console.error('Error loading badges:', err)
      setError(err instanceof Error ? err.message : 'Failed to load badges')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBadges()
  }, [user?.id])

  const filterByCategory = (category: BadgeCategory | 'all'): BadgeWithProgress[] => {
    if (category === 'all') return badges
    return badges.filter((badge) => badge.category === category)
  }

  const getUnlockedBadges = (): BadgeWithProgress[] => {
    return badges.filter((badge) => badge.is_unlocked)
  }

  const getLockedBadges = (): BadgeWithProgress[] => {
    return badges.filter((badge) => !badge.is_unlocked)
  }

  return {
    badges,
    userProgress,
    isLoading,
    error,
    filterByCategory,
    getUnlockedBadges,
    getLockedBadges,
    refetch: loadBadges,
  }
}
