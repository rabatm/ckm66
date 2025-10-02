import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { globalStyles, colors } from '@/theme'

// Mock course data - will be replaced with real data from Supabase
const MOCK_COURSES = [
  {
    id: '1',
    title: 'Krav Maga - Débutant',
    day: 'Lundi',
    time: '18h00 - 19h30',
    instructor: 'Jean Dupont',
    location: 'Gymnase Municipal',
    availableSpots: 12,
    totalSpots: 20,
    registered: false,
  },
  {
    id: '2',
    title: 'Krav Maga - Intermédiaire',
    day: 'Mercredi',
    time: '19h00 - 20h30',
    instructor: 'Marie Martin',
    location: 'Dojo Central',
    availableSpots: 2,
    totalSpots: 15,
    registered: false,
  },
  {
    id: '3',
    title: 'Krav Maga - Avancé',
    day: 'Vendredi',
    time: '18h30 - 20h00',
    instructor: 'Paul Durand',
    location: 'Gymnase Municipal',
    availableSpots: 0,
    totalSpots: 15,
    registered: false,
  },
  {
    id: '4',
    title: 'Krav Maga - Tous niveaux',
    day: 'Samedi',
    time: '10h00 - 11h30',
    instructor: 'Sophie Bernard',
    location: 'Dojo Central',
    availableSpots: 8,
    totalSpots: 20,
    registered: true,
  },
]

export const ScheduleScreen = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showAttendance, setShowAttendance] = useState(false)

  const handleRegister = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return

    if (course.availableSpots === 0) {
      Alert.alert('Complet', 'Ce cours est complet')
      return
    }

    Alert.alert(
      'Confirmation',
      `Voulez-vous vous inscrire à "${course.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setCourses(courses.map(c =>
              c.id === courseId
                ? { ...c, registered: true, availableSpots: c.availableSpots - 1 }
                : c
            ))
            Alert.alert('Succès', 'Inscription confirmée !')
          }
        }
      ]
    )
  }

  const handleCancel = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return

    Alert.alert(
      'Annulation',
      `Voulez-vous annuler votre inscription à "${course.title}" ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            setCourses(courses.map(c =>
              c.id === courseId
                ? { ...c, registered: false, availableSpots: c.availableSpots + 1 }
                : c
            ))
            Alert.alert('Succès', 'Inscription annulée')
          }
        }
      ]
    )
  }

  const handleViewAttendance = (course: any) => {
    setSelectedCourse(course)
    setShowAttendance(true)
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView style={globalStyles.scrollView}>
        {/* My Registrations */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Mes inscriptions</Text>
          {courses.filter(c => c.registered).length === 0 ? (
            <View style={globalStyles.emptyCard}>
              <Text style={globalStyles.emptyText}>Aucune inscription</Text>
            </View>
          ) : (
            courses.filter(c => c.registered).map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onAction={() => handleCancel(course.id)}
                onViewAttendance={() => handleViewAttendance(course)}
                actionLabel="Annuler"
                actionColor="#DC2626"
              />
            ))
          )}
        </View>

        {/* Available Courses */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Cours disponibles</Text>
          {courses.filter(c => !c.registered).map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onAction={() => handleRegister(course.id)}
              onViewAttendance={() => handleViewAttendance(course)}
              actionLabel={course.availableSpots === 0 ? 'Complet' : 'S\'inscrire'}
              actionColor="#3B82F6"
              actionDisabled={course.availableSpots === 0}
            />
          ))}
        </View>
      </ScrollView>

      {/* Attendance Modal */}
      <AttendanceModal
        visible={showAttendance}
        course={selectedCourse}
        onClose={() => setShowAttendance(false)}
      />
    </View>
  )
}

function CourseCard({
  course,
  onAction,
  onViewAttendance,
  actionLabel,
  actionColor,
  actionDisabled
}: {
  course: any
  onAction: () => void
  onViewAttendance: () => void
  actionLabel: string
  actionColor: string
  actionDisabled?: boolean
}) {
  const spotsColor = course.availableSpots === 0 ? '#DC2626' : course.availableSpots < 5 ? '#F59E0B' : '#10B981'

  return (
    <View style={globalStyles.card}>
      <View style={globalStyles.cardHeader}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View style={[styles.dayBadge, { backgroundColor: actionColor + '20' }]}>
          <Text style={[styles.dayText, { color: actionColor }]}>{course.day}</Text>
        </View>
      </View>

      <View style={styles.courseDetailRow}>
        <Ionicons name="time-outline" size={16} color="#4B5563" />
        <Text style={styles.courseTime}>{course.time}</Text>
      </View>
      <View style={styles.courseDetailRow}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <Text style={styles.courseDetail}>{course.instructor}</Text>
      </View>
      <View style={styles.courseDetailRow}>
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <Text style={styles.courseDetail}>{course.location}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.spotsText, { color: spotsColor }]}>
          {course.availableSpots} / {course.totalSpots} places
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={onViewAttendance}
            activeOpacity={0.7}
          >
            <View style={styles.attendanceButtonContent}>
              <Ionicons name="people-outline" size={16} color="#374151" />
              <Text style={styles.attendanceButtonText}>Liste</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: actionColor },
              actionDisabled && styles.actionButtonDisabled
            ]}
            onPress={onAction}
            disabled={actionDisabled}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

function AttendanceModal({ visible, course, onClose }: { visible: boolean; course: any; onClose: () => void }) {
  // Mock participants - will be replaced with real data
  const participants = [
    { id: '1', name: 'Martin Dupont', email: 'martin@example.com' },
    { id: '2', name: 'Sophie Bernard', email: 'sophie@example.com' },
    { id: '3', name: 'Pierre Martin', email: 'pierre@example.com' },
  ]

  if (!course) return null

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Liste des participants</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalCourseInfo}>
            <Text style={styles.modalCourseTitle}>{course.title}</Text>
            <Text style={styles.modalCourseDetail}>
              {course.day} • {course.time}
            </Text>
          </View>

          <ScrollView style={styles.participantsList}>
            <Text style={styles.participantsCount}>
              {participants.length} participant{participants.length > 1 ? 's' : ''}
            </Text>
            {participants.map((participant, index) => (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantEmail}>{participant.email}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.modalCloseButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  // Les styles container, scrollView, section, sectionTitle, emptyCard, emptyText
  // card, cardHeader, et courseTitle utilisent maintenant globalStyles
  // Voir globalStyles.container, globalStyles.card, etc.
  
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  courseTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  courseDetail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  spotsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  attendanceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendanceButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: colors.text.secondary,
    lineHeight: 32,
  },
  modalCourseInfo: {
    backgroundColor: colors.background.tertiary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalCourseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modalCourseDetail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  participantsList: {
    maxHeight: 400,
  },
  participantsCount: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  modalCloseButton: {
    backgroundColor: colors.primary[500],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
})
