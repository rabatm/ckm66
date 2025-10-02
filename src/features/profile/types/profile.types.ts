/**
 * Profile Types
 * Type definitions for profile and subscription management
 */

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  phone?: string
  profile_picture_url?: string
}

export type SubscriptionType = 'monthly' | 'quarterly' | 'annual' | 'session_pack'

export type SubscriptionStatus = 'active' | 'expiring' | 'expired' | 'none'

export interface Subscription {
  id: string
  user_id: string
  type: SubscriptionType
  status: string
  start_date: string
  end_date: string
  valid_until: string | null
  remaining_sessions: number | null
  price: number | null
  is_active: boolean | null
  payment_status: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SubscriptionInfo {
  subscription: Subscription | null
  status: SubscriptionStatus
  statusLabel: string
  statusColor: string
  typeLabel: string
  daysRemaining: number | null
  isExpiringSoon: boolean
}

export const SUBSCRIPTION_TYPE_LABELS: Record<SubscriptionType, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
  session_pack: 'Pack de séances',
}

export const SUBSCRIPTION_STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#10B981' },
  expiring: { label: 'Expire bientôt', color: '#F59E0B' },
  expired: { label: 'Expiré', color: '#EF4444' },
  none: { label: 'Aucun abonnement', color: '#6B7280' },
}
