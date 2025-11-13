import React, { useMemo } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { useInstanceReservations } from '../hooks'

interface StudentsListModalProps {
  visible: boolean
  courseInstanceId: string
  courseName: string
  onClose: () => void
}

export function StudentsListModal({
  visible,
  courseInstanceId,
  courseName,
  onClose,
}: StudentsListModalProps) {
  const { data: allReservations, isLoading } = useInstanceReservations(courseInstanceId)

  // Filter for only confirmed students
  const confirmedReservations = useMemo(() => {
    if (!allReservations) return []
    return allReservations.filter((res: any) => res.status === 'confirmed')
  }, [allReservations])

  const getStudentInitials = (user: any): string => {
    const firstInitial = user?.first_name?.charAt(0) ?? 'S'
    const lastInitial = user?.last_name?.charAt(0) ?? 'U'
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{courseName}</Text>
            <Text style={styles.headerSubtitle}>
              {confirmedReservations.length} élève{confirmedReservations.length !== 1 ? 's' : ''} inscrit
              {confirmedReservations.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : confirmedReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Aucun élève inscrit</Text>
            <Text style={styles.emptyText}>
              Les élèves apparaîtront ici une fois qu'ils se seront inscrits
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.studentsList} contentContainerStyle={styles.studentsListContent}>
            {confirmedReservations.map((reservation: any, index: number) => (
              <View
                key={reservation.id}
                style={[
                  styles.studentCard,
                  index === confirmedReservations.length - 1 && styles.lastStudentCard,
                ]}
              >
                <View style={styles.studentHeader}>
                  <Text style={styles.studentNumber}>#{index + 1}</Text>
                </View>

                <View style={styles.studentContent}>
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
                    <Text style={styles.studentEmail}>{reservation.user?.email}</Text>
                    <Text style={styles.enrollDate}>
                      Inscrit le {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>

                  <View style={styles.enrolledBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
  },
  studentsList: {
    flex: 1,
  },
  studentsListContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  studentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  lastStudentCard: {
    marginBottom: 0,
  },
  studentHeader: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  studentNumber: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  studentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  studentEmail: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  enrollDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  enrolledBadge: {
    paddingLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
