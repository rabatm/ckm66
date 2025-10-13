/**
 * Badge Types
 * Type definitions for the badge system
 */

export type BadgeType = 'automatic' | 'manual'

export type BadgeCategory =
  | 'assiduity'
  | 'presence'
  | 'punctuality'
  | 'discipline'
  | 'longevity'
  | 'technical'
  | 'quality'
  | 'attitude'
  | 'custom'

export type RequirementRuleType =
  | 'total_classes'
  | 'current_streak'
  | 'membership_months'
  | 'monthly_attendance'
  | 'quarterly_attendance'
  | 'on_time_count'
  | 'early_arrivals'
  | 'timely_cancellations'
  | 'no_late_cancel_months'
  | 'profile_complete'

export interface RequirementRule {
  type: RequirementRuleType
  operator?: '>=' | '>' | '=' | '<' | '<='
  value: number | boolean
}

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon_emoji: string
  points: number
  type: BadgeType
  category: BadgeCategory
  is_system: boolean
  created_by: string | null
  requirement_rule: RequirementRule | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
  awarded_by: string | null
  coach_message: string | null
  created_at: string
  // Joined data from Badge
  badge?: Badge
  // Joined data from Profile (for awarded_by)
  coach?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface BadgeWithProgress extends Badge {
  is_unlocked: boolean
  unlocked_at?: string | undefined
  awarded_by?: string | null | undefined
  coach_name?: string | undefined
  coach_message?: string | null | undefined
  progress?:
    | {
        current: number
        required: number
        percentage: number
      }
    | undefined
}

export type UserLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface LevelInfo {
  level: UserLevel
  title: string
  min_points: number
  max_points: number
  color: string
}

export const LEVELS: Record<UserLevel, LevelInfo> = {
  1: { level: 1, title: 'Débutant', min_points: 0, max_points: 150, color: '#9CA3AF' },
  2: { level: 2, title: 'Apprenti', min_points: 151, max_points: 450, color: '#60A5FA' },
  3: { level: 3, title: 'Pratiquant', min_points: 451, max_points: 900, color: '#34D399' },
  4: { level: 4, title: 'Confirmé', min_points: 901, max_points: 1500, color: '#FBBF24' },
  5: { level: 5, title: 'Expert', min_points: 1501, max_points: 2400, color: '#F97316' },
  6: { level: 6, title: 'Maître', min_points: 2401, max_points: 3600, color: '#A855F7' },
  7: { level: 7, title: 'Légende', min_points: 3601, max_points: 999999, color: '#EF4444' },
}

export interface UserProgress {
  total_points: number
  current_level: UserLevel
  level_info: LevelInfo
  next_level_info: LevelInfo | null
  points_to_next_level: number
  progress_percentage: number
  total_badges: number
  unlocked_badges: number
  badges_percentage: number
}

export interface BadgeStats {
  total_badges: number
  unlocked_badges: number
  locked_badges: number
  automatic_unlocked: number
  manual_unlocked: number
  total_points: number
  by_category: Record<
    BadgeCategory,
    {
      total: number
      unlocked: number
    }
  >
}

export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  assiduity: 'Assiduité',
  presence: 'Présence',
  punctuality: 'Ponctualité',
  discipline: 'Discipline',
  longevity: 'Longévité',
  technical: 'Technique',
  quality: 'Qualité',
  attitude: 'Attitude',
  custom: 'Personnalisé',
}

export const CATEGORY_ICONS: Record<BadgeCategory, string> = {
  assiduity: 'flag',
  presence: 'flash',
  punctuality: 'time',
  discipline: 'checkmark-circle',
  longevity: 'calendar',
  technical: 'fitness',
  quality: 'bulb',
  attitude: 'people',
  custom: 'star',
}
