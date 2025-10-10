import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import type { CourseFilters as CourseFiltersType } from '../types'
import { DAYS_OF_WEEK } from '../types'

interface CourseFiltersProps {
  filters: CourseFiltersType
  onChange: (filters: CourseFiltersType) => void
  locations?: string[]
}

export function CourseFilters({ filters, onChange, locations = [] }: CourseFiltersProps) {
  const toggleDay = (day: number | undefined) => {
    if (day === undefined || filters.dayOfWeek === day) {
      const { ...rest } = filters
      delete rest.dayOfWeek
      onChange(rest)
    } else {
      onChange({ ...filters, dayOfWeek: day })
    }
  }

  const toggleLocation = (location: string) => {
    if (filters.location === location) {
      const { ...rest } = filters
      delete rest.location
      onChange(rest)
    } else {
      onChange({ ...filters, location })
    }
  }

  const toggleAvailableOnly = () => {
    onChange({ ...filters, availableOnly: !filters.availableOnly })
  }

  const clearFilters = () => {
    onChange({})
  }

  const hasActiveFilters =
    filters.dayOfWeek !== undefined || filters.location !== undefined || filters.availableOnly

  return (
    <View style={styles.container}>
      {/* Days Filter */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={16} color={colors.text.secondary} />
          <Text style={styles.sectionTitle}>Jour</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          <TouchableOpacity
            style={[styles.chip, filters.dayOfWeek === undefined && styles.chipActive]}
            onPress={() => toggleDay(undefined)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, filters.dayOfWeek === undefined && styles.chipTextActive]}
            >
              Tous
            </Text>
          </TouchableOpacity>

          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[styles.chip, filters.dayOfWeek === day.value && styles.chipActive]}
              onPress={() => toggleDay(day.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, filters.dayOfWeek === day.value && styles.chipTextActive]}
              >
                {day.short}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Locations Filter */}
      {locations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionTitle}>Lieu</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[styles.chip, filters.location === location && styles.chipActive]}
                onPress={() => toggleLocation(location)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, filters.location === location && styles.chipTextActive]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Available Only Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={toggleAvailableOnly}
          activeOpacity={0.7}
        >
          <View style={styles.toggleLeft}>
            <Ionicons name="people" size={16} color={colors.text.secondary} />
            <Text style={styles.toggleText}>Uniquement les cours disponibles</Text>
          </View>
          <View style={[styles.toggle, filters.availableOnly && styles.toggleActive]}>
            <View
              style={[styles.toggleCircle, filters.availableOnly && styles.toggleCircleActive]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={16} color={colors.text.secondary} />
          <Text style={styles.clearButtonText}>Réinitialiser les filtres</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  chipContainer: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  toggleText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.tertiary,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.text.disabled,
  },
  toggleCircleActive: {
    backgroundColor: colors.text.primary,
    alignSelf: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
    marginTop: spacing.sm,
  },
  clearButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
})
