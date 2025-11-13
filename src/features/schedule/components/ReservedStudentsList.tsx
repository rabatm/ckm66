import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { useInstanceReservations } from '../hooks'

interface ReservedStudentsListProps {
  courseInstanceId: string
  maxVisibleStudents?: number
}

export function ReservedStudentsList({
  courseInstanceId,
  maxVisibleStudents = 3,
}: ReservedStudentsListProps) {
  const { data: allReservations, isLoading } = useInstanceReservations(courseInstanceId)
  const [showAll, setShowAll] = useState(false)

  // Filter for only confirmed students
  const confirmedReservations = useMemo(() => {
    if (!allReservations) return []
    return allReservations.filter((res: any) => res.status === 'confirmed')
  }, [allReservations])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    )
  }

  if (!confirmedReservations || confirmedReservations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.emptyText}>Aucun élève inscrit</Text>
      </View>
    )
  }

  const displayedReservations = showAll ? confirmedReservations : confirmedReservations.slice(0, maxVisibleStudents)
  const hasMore = confirmedReservations.length > maxVisibleStudents && !showAll

  const getStudentInitials = (user: any): string => {
    const firstInitial = user?.first_name?.charAt(0) ?? 'S'
    const lastInitial = user?.last_name?.charAt(0) ?? 'U'
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={16} color={colors.primary[500]} />
        <Text style={styles.headerText}>
          Élèves inscrits ({confirmedReservations.length})
        </Text>
      </View>

      <View style={styles.studentsList}>
        {displayedReservations.map((reservation: any) => (
          <View key={reservation.id} style={styles.studentRow}>
            {reservation.user?.profile_picture_url ? (
              <Image
                source={{ uri: reservation.user.profile_picture_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getStudentInitials(reservation.user)}</Text>
              </View>
            )}
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {reservation.user?.first_name} {reservation.user?.last_name}
              </Text>
              <Text style={styles.enrollDate}>
                Inscrit le {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAll(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.showMoreText}>
            Voir les {confirmedReservations.length - maxVisibleStudents} autres
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  headerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  studentsList: {
    gap: spacing.sm,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  enrollDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  showMoreText: {
    fontSize: typography.sizes.xs,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  loadingContainer: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
})
