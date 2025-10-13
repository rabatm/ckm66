import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { DarkCard } from '@/components/ui'
import type { SubscriptionInfo } from '../types/profile.types'
import { getSessionUsagePercentage } from '../services/subscription.service'
import type { AuthUser } from '@/features/auth/types/auth.types'

interface SubscriptionCardProps {
  subscriptionInfo: SubscriptionInfo | null
  isLoading: boolean
  user?: AuthUser | null
}

export function SubscriptionCard({ subscriptionInfo, isLoading, user }: SubscriptionCardProps) {
  if (isLoading) {
    return (
      <DarkCard>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </DarkCard>
    )
  }

  if (!subscriptionInfo?.subscription) {
    // Check if user is a guest and show free trials
    if (user?.role === 'guest' && user.free_trials_remaining !== null) {
      return (
        <DarkCard style={styles.subscriptionCard}>
          <View style={styles.header}>
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.statusBadgeText}>Essai gratuit</Text>
            </View>
            <Text style={styles.subscriptionType}>Membre invité</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Ionicons name="ticket" size={14} color={colors.text.tertiary} />
                <Text style={styles.label}>Essais restants</Text>
              </View>
              <Text style={styles.value}>
                {`${user.free_trials_remaining} essai${user.free_trials_remaining !== 1 ? 's' : ''} restant${user.free_trials_remaining !== 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>
        </DarkCard>
      )
    }

    return (
      <DarkCard style={styles.noSubscriptionCard}>
        <Ionicons name="clipboard-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.noSubscriptionTitle}>Aucun abonnement actif</Text>
        <Text style={styles.noSubscriptionText}>
          Contactez votre instructeur pour souscrire à un abonnement
        </Text>
      </DarkCard>
    )
  }

  return (
    <DarkCard style={[styles.subscriptionCard, { borderLeftColor: subscriptionInfo.statusColor }]}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: subscriptionInfo.statusColor }]}>
          <Text style={styles.statusBadgeText}>{subscriptionInfo.statusLabel}</Text>
        </View>
        <Text style={styles.subscriptionType}>{subscriptionInfo.typeLabel}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Ionicons name="calendar" size={14} color={colors.text.tertiary} />
            <Text style={styles.label}>Expire le</Text>
          </View>
          <Text style={styles.value}>
            {new Date(subscriptionInfo.subscription.end_date).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {subscriptionInfo.subscription.remaining_sessions !== null && (
          <>
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Ionicons name="ticket" size={14} color={colors.text.tertiary} />
                <Text style={styles.label}>Séances restantes</Text>
              </View>
              <Text style={styles.value}>{subscriptionInfo.subscription.remaining_sessions}</Text>
            </View>
            <View style={styles.sessionProgressBar}>
              <View
                style={[
                  styles.sessionProgressFill,
                  {
                    width: `${getSessionUsagePercentage(subscriptionInfo.subscription)}%`,
                    backgroundColor: subscriptionInfo.statusColor,
                  },
                ]}
              />
            </View>
          </>
        )}

        {subscriptionInfo.isExpiringSoon && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Votre abonnement expire dans {subscriptionInfo.daysRemaining} jour
              {subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </DarkCard>
  )
}

const styles = StyleSheet.create({
  subscriptionCard: {
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  statusBadgeText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  subscriptionType: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  details: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  sessionProgressBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sessionProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary[500],
    padding: spacing.sm,
    borderRadius: 8,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: colors.secondary[500],
  },
  noSubscriptionCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  noSubscriptionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noSubscriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
