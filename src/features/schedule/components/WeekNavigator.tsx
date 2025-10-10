import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'

interface WeekNavigatorProps {
  weekStart: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
}

export function WeekNavigator({ weekStart, onPreviousWeek, onNextWeek }: WeekNavigatorProps) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const formatWeekRange = () => {
    const startMonth = weekStart.toLocaleDateString('fr-FR', { month: 'short' })
    const endMonth = weekEnd.toLocaleDateString('fr-FR', { month: 'short' })
    const startDay = weekStart.getDate()
    const endDay = weekEnd.getDate()

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
  }

  const isCurrentWeek = () => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayWeekStart = new Date(todayStart)
    todayWeekStart.setDate(todayStart.getDate() - todayStart.getDay())

    return weekStart.getTime() === todayWeekStart.getTime()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navButton} onPress={onPreviousWeek} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.weekInfo}>
        <Text style={styles.weekRange}>{formatWeekRange()}</Text>
        {isCurrentWeek() && (
          <View style={styles.currentWeekBadge}>
            <Text style={styles.currentWeekText}>Cette semaine</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.navButton} onPress={onNextWeek} activeOpacity={0.7}>
        <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  weekRange: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  currentWeekBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentWeekText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
})
