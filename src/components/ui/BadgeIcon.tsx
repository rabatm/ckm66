import React from 'react'
import { Ionicons } from '@expo/vector-icons'

interface BadgeIconProps {
  badgeCode: string
  size?: number
  color?: string
}

// Mapping des codes de badges vers les icônes Ionicons
const BADGE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  // ASSIDUITY BADGES
  first_class: 'flag-outline',
  motivated: 'flame-outline',
  engaged: 'fitness-outline',
  regular: 'ribbon-outline',
  loyal: 'star-outline',
  centurion: 'shield-checkmark-outline',
  legend: 'trophy-outline',
  master_attendance: 'medal-outline',

  // PRESENCE BADGES
  perfect_month: 'flash-outline',
  streak_5: 'flame',
  streak_10: 'thunderstorm-outline',
  quarterly: 'sparkles-outline',

  // PUNCTUALITY BADGES
  on_time: 'time-outline',
  early_bird: 'rocket-outline',

  // DISCIPLINE BADGES
  good_student: 'checkmark-circle-outline',
  rule_respect: 'shield-outline',
  communicative: 'mail-outline',

  // LONGEVITY BADGES
  '3_months': 'calendar-outline',
  '6_months': 'calendar',
  '1_year': 'gift-outline',
  '2_years': 'balloon-outline',
  veteran: 'diamond-outline',

  // TECHNICAL BADGES
  basic_techniques: 'body-outline',
  perfect_strikes: 'hand-left-outline',
  leg_master: 'footsteps-outline',
  defender: 'shield-half-outline',
  knife_pro: 'cut-outline',
  weapon_counter: 'nuclear-outline',
  grappling_expert: 'people-outline',

  // QUALITY BADGES
  quick_learner: 'bulb-outline',
  strategist: 'cube-outline',
  fighter: 'flash',
  precision: 'locate-outline',
  power: 'nuclear',
  speed: 'speedometer-outline',

  // ATTITUDE BADGES
  team_spirit: 'people-circle-outline',
  mentor: 'heart-outline',
  motivation: 'sunny-outline',
  leader: 'medal',
  remarkable_progress: 'trending-up-outline',

  // SPECIAL BADGES
  first_login: 'enter-outline',
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badgeCode, size = 24, color = '#6B7280' }) => {
  const iconName = BADGE_ICON_MAP[badgeCode] || 'help-circle-outline'

  return <Ionicons name={iconName} size={size} color={color} />
}
