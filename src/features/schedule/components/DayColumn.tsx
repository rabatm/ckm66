import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography } from '@/theme'
import type { CourseInstanceWithDetails } from '../types'
import { InstanceCard } from './InstanceCard'

interface DayColumnProps {
  date: Date
  instances: CourseInstanceWithDetails[]
  onBookInstance: (instance: CourseInstanceWithDetails) => void
  onCancelReservation: (instance: CourseInstanceWithDetails) => void
}

export function DayColumn({
  date,
  instances,
  onBookInstance,
  onCancelReservation,
}: DayColumnProps) {
  const isToday = () => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPast = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' })
  const dayNumber = date.getDate()

  const sortedInstances = instances.sort((a, b) => {
    return a.start_time.localeCompare(b.start_time)
  })

  return (
    <View style={[styles.container, isPast() && styles.pastDay]}>
      {/* Day Header */}
      <View style={[styles.header, isToday() && styles.todayHeader]}>
        <Text style={[styles.dayName, isToday() && styles.todayText]}>
          {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
        </Text>
        <View style={[styles.dayNumberContainer, isToday() && styles.todayNumber]}>
          <Text style={[styles.dayNumber, isToday() && styles.todayNumberText]}>{dayNumber}</Text>
        </View>
      </View>

      {/* Instances */}
      <View style={styles.instancesContainer}>
        {sortedInstances.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun cours</Text>
          </View>
        ) : (
          sortedInstances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              onBook={() => onBookInstance(instance)}
              onCancel={() => onCancelReservation(instance)}
              showDate={false}
            />
          ))
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 280,
    marginRight: spacing.md,
  },
  pastDay: {
    opacity: 0.6,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  todayHeader: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  dayName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  todayText: {
    color: colors.text.primary,
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumber: {
    backgroundColor: colors.background.primary,
  },
  dayNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  todayNumberText: {
    color: colors.text.primary,
  },
  instancesContainer: {
    gap: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.dark,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
})
