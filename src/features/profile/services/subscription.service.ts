/**
 * Subscription Service
 * Handles all subscription-related operations with Supabase
 */

import { supabase } from '@/lib/supabase'
import type {
  Subscription,
  SubscriptionInfo,
  SubscriptionStatus,
  SubscriptionType,
  SUBSCRIPTION_TYPE_LABELS,
  SUBSCRIPTION_STATUS_CONFIG,
} from '../types/profile.types'

const TYPE_LABELS: Record<SubscriptionType, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
  session_pack: 'Pack de séances',
}

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#10B981' },
  expiring: { label: 'Expire bientôt', color: '#F59E0B' },
  expired: { label: 'Expiré', color: '#EF4444' },
  none: { label: 'Aucun abonnement', color: '#6B7280' },
}

/**
 * Fetch user's active subscription
 */
export async function getUserActiveSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data as Subscription | null
}

/**
 * Calculate subscription status based on dates
 */
export function getSubscriptionStatus(subscription: Subscription | null): SubscriptionStatus {
  if (!subscription) return 'none'

  const now = new Date()
  const endDate = new Date(subscription.end_date)
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) return 'expired'
  if (daysRemaining <= 7) return 'expiring'
  return 'active'
}

/**
 * Format subscription type for display
 */
export function formatSubscriptionType(type: string): string {
  return TYPE_LABELS[type as SubscriptionType] || type
}

/**
 * Get days remaining until subscription expires
 */
export function getDaysRemaining(subscription: Subscription | null): number | null {
  if (!subscription) return null

  const now = new Date()
  const endDate = new Date(subscription.end_date)
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Get complete subscription information with status
 */
export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  const subscription = await getUserActiveSubscription(userId)
  const status = getSubscriptionStatus(subscription)
  const daysRemaining = getDaysRemaining(subscription)
  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7

  const config = STATUS_CONFIG[status]

  return {
    subscription,
    status,
    statusLabel: config.label,
    statusColor: config.color,
    typeLabel: subscription ? formatSubscriptionType(subscription.type) : '',
    daysRemaining,
    isExpiringSoon,
  }
}

/**
 * Calculate session usage percentage
 */
export function getSessionUsagePercentage(subscription: Subscription | null): number {
  if (!subscription || !subscription.remaining_sessions) return 0

  // Assuming we need to calculate based on initial sessions
  // For now, we'll estimate based on monthly = 8, quarterly = 24, annual = 96
  const initialSessions: Record<string, number> = {
    monthly: 8,
    quarterly: 24,
    annual: 96,
    session_pack: 10, // default for pack
  }

  const initial = initialSessions[subscription.type] || 10
  const remaining = subscription.remaining_sessions
  const used = initial - remaining

  return Math.round((used / initial) * 100)
}
