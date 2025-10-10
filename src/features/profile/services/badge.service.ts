/**
 * Badge Service
 * Handles all badge-related operations with Supabase
 */

import { supabase } from '@/lib/supabase'
import type {
  Badge,
  UserBadge,
  BadgeWithProgress,
  UserProgress,
  BadgeCategory,
  BadgeType,
} from '../types/badge.types'
import { LEVELS } from '../types/badge.types'

// Re-export types for convenience
export type { Badge, UserBadge, BadgeWithProgress, UserProgress, BadgeCategory, BadgeType }

/**
 * Fetch all badges from the catalogue
 */
export async function fetchAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching badges:', error)
    throw error
  }

  return (data || []) as Badge[]
}

/**
 * Fetch badges unlocked by a specific user
 */
export async function fetchUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(
      `
      *,
      badge:badges(*),
      coach:profiles!user_badges_awarded_by_fkey(id, first_name, last_name)
    `
    )
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })

  if (error) {
    console.error('Error fetching user badges:', error)
    throw error
  }

  return (data || []) as any as UserBadge[]
}

/**
 * Fetch all badges with user's progress
 */
export async function fetchBadgesWithProgress(userId: string): Promise<BadgeWithProgress[]> {
  // Fetch all badges
  const allBadges = await fetchAllBadges()

  // Fetch user's unlocked badges
  const userBadges = await fetchUserBadges(userId)

  // Fetch user profile for progress calculations
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  // If no profile exists, return badges without progress
  if (!profile) {
    console.warn(`No profile found for user ${userId}`)
    return allBadges.map((badge) => ({
      ...badge,
      is_unlocked: false,
      unlocked_at: undefined,
      awarded_by: undefined,
      coach_name: undefined,
      coach_message: undefined,
      progress: undefined,
    })) as BadgeWithProgress[]
  }

  // Map badges with progress
  const badgesWithProgress: BadgeWithProgress[] = allBadges.map((badge) => {
    const userBadge = userBadges.find((ub) => ub.badge_id === badge.id)
    const isUnlocked = !!userBadge

    let progress: BadgeWithProgress['progress'] | undefined

    // Calculate progress for automatic badges
    if (!isUnlocked && badge.type === 'automatic' && badge.requirement_rule && profile) {
      const rule = badge.requirement_rule
      let current = 0
      let required = Number(rule.value)

      switch (rule.type) {
        case 'total_classes':
          current = profile.total_classes || 0
          break
        case 'current_streak':
          current = profile.current_streak || 0
          break
        case 'membership_months':
          const joinDate = new Date(profile.join_date || profile.created_at || new Date())
          const monthsDiff = Math.floor(
            (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          )
          current = monthsDiff
          break
        default:
          current = 0
      }

      progress = {
        current: Math.min(current, required),
        required,
        percentage: Math.min(Math.round((current / required) * 100), 100),
      }
    }

    return {
      ...badge,
      is_unlocked: isUnlocked,
      unlocked_at: userBadge?.unlocked_at || undefined,
      awarded_by: userBadge?.awarded_by || undefined,
      coach_name: userBadge?.coach
        ? `${userBadge.coach.first_name} ${userBadge.coach.last_name}`
        : undefined,
      coach_message: userBadge?.coach_message || undefined,
      progress,
    }
  })

  return badgesWithProgress as BadgeWithProgress[]
}

/**
 * Get user progress summary (level, points, badges)
 */
export async function getUserProgress(userId: string): Promise<UserProgress> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('total_points, current_level')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user progress:', error)
    throw error
  }

  // If no profile exists, return default values
  if (!profile) {
    console.warn(`No profile found for user ${userId}, returning default progress`)
  }

  const totalPoints = profile?.total_points || 0
  const currentLevel = (profile?.current_level || 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7

  const levelInfo = LEVELS[currentLevel]
  const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  const nextLevelInfo = nextLevel <= 7 ? LEVELS[nextLevel as 1 | 2 | 3 | 4 | 5 | 6 | 7] : null

  const pointsToNextLevel = nextLevelInfo ? nextLevelInfo.min_points - totalPoints : 0

  const progressPercentage = nextLevelInfo
    ? Math.round((totalPoints / nextLevelInfo.min_points) * 100)
    : 100

  // Count badges
  const { count: totalBadges } = await supabase
    .from('badges')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: unlockedBadges } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const badgesPercentage = totalBadges ? Math.round(((unlockedBadges || 0) / totalBadges) * 100) : 0

  return {
    total_points: totalPoints,
    current_level: currentLevel,
    level_info: levelInfo,
    next_level_info: nextLevelInfo,
    points_to_next_level: pointsToNextLevel,
    progress_percentage: progressPercentage,
    total_badges: totalBadges || 0,
    unlocked_badges: unlockedBadges || 0,
    badges_percentage: badgesPercentage,
  }
}

/**
 * Check and automatically unlock badges for a user
 * This should be called after a user attends a class or updates their stats
 */
export async function checkAndUnlockBadges(userId: string): Promise<{
  newly_unlocked_count: number
  newly_unlocked_badges: Array<{ badge_id: string; code: string; name: string; points: number }>
}> {
  try {
    const { data, error } = await supabase.rpc('check_and_unlock_badges', { p_user_id: userId })

    if (error) {
      console.error('Error checking and unlocking badges:', error)
      throw error
    }

    const result = data?.[0] || { newly_unlocked_count: 0, newly_unlocked_badges: [] }

    return {
      newly_unlocked_count: result.newly_unlocked_count || 0,
      newly_unlocked_badges: result.newly_unlocked_badges || [],
    }
  } catch (error) {
    console.error('Error in checkAndUnlockBadges:', error)
    return {
      newly_unlocked_count: 0,
      newly_unlocked_badges: [],
    }
  }
}

/**
 * Award a badge manually (by instructor)
 * @param userId - User to award the badge to
 * @param badgeId - Badge to award
 * @param coachId - ID of the coach awarding the badge
 * @param message - Optional personal message from the coach
 */
export async function awardBadgeManually(
  userId: string,
  badgeId: string,
  coachId: string,
  message?: string
): Promise<void> {
  const { error } = await supabase.from('user_badges').insert({
    user_id: userId,
    badge_id: badgeId,
    awarded_by: coachId,
    coach_message: message || null,
  })

  if (error) {
    console.error('Error awarding badge:', error)
    throw error
  }
}

/**
 * Create a custom badge (coach only)
 * @param coachId - ID of the coach creating the badge
 * @param badgeData - Badge information
 */
export async function createCustomBadge(
  coachId: string,
  badgeData: {
    code: string
    name: string
    description: string
    icon_emoji: string
    points: number
    category: BadgeCategory
  }
): Promise<Badge> {
  const { data, error } = await supabase
    .from('badges')
    .insert({
      ...badgeData,
      type: 'manual',
      is_system: false,
      created_by: coachId,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating custom badge:', error)
    throw error
  }

  return data as Badge
}

/**
 * Get badge statistics for a user
 */
export async function getBadgeStats(userId: string) {
  const badges = await fetchBadgesWithProgress(userId)

  const stats = {
    total_badges: badges.length,
    unlocked_badges: badges.filter((b) => b.is_unlocked).length,
    locked_badges: badges.filter((b) => !b.is_unlocked).length,
    automatic_unlocked: badges.filter((b) => b.is_unlocked && b.type === 'automatic').length,
    manual_unlocked: badges.filter((b) => b.is_unlocked && b.type === 'manual').length,
    total_points: badges.filter((b) => b.is_unlocked).reduce((sum, b) => sum + b.points, 0),
    by_category: {} as Record<BadgeCategory, { total: number; unlocked: number }>,
  }

  // Count by category
  const categories: BadgeCategory[] = [
    'assiduity',
    'presence',
    'punctuality',
    'discipline',
    'longevity',
    'technical',
    'quality',
    'attitude',
    'custom',
  ]

  categories.forEach((category) => {
    const categoryBadges = badges.filter((b) => b.category === category)
    stats.by_category[category] = {
      total: categoryBadges.length,
      unlocked: categoryBadges.filter((b) => b.is_unlocked).length,
    }
  })

  return stats
}
