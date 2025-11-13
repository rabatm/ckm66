import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native'
import { colors, spacing, typography } from '@/theme'
import { supabase } from '@/lib/supabase'

interface NotificationPreferencesCardProps {
  userId: string
  onUpdate?: () => void
}

export const NotificationPreferencesCard: React.FC<NotificationPreferencesCardProps> = ({
  userId,
  onUpdate,
}) => {
  const [courseReminders, setCourseReminders] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch current preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('notify_course_reminders, notify_messages')
          .eq('id', userId)
          .single()

        if (error) throw error

        if (data) {
          setCourseReminders(data.notify_course_reminders ?? true)
          setMessageNotifications(data.notify_messages ?? true)
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error)
        Alert.alert('Erreur', 'Impossible de charger les préférences')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [userId])

  const handleCourseRemindersToggle = async (value: boolean) => {
    setCourseReminders(value)
    await savePreference('notify_course_reminders', value)
  }

  const handleMessageNotificationsToggle = async (value: boolean) => {
    setMessageNotifications(value)
    await savePreference('notify_messages', value)
  }

  const savePreference = async (key: string, value: boolean) => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', userId)

      if (error) throw error

      onUpdate?.()
    } catch (error) {
      console.error(`Error updating ${key}:`, error)
      Alert.alert('Erreur', 'Impossible de mettre à jour la préférence')
      // Revert the toggle
      if (key === 'notify_course_reminders') {
        setCourseReminders(!value)
      } else {
        setMessageNotifications(!value)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Paramètres de notifications</Text>

      {/* Course Reminders Toggle */}
      <View style={styles.preferenceRow}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Rappels de cours</Text>
          <Text style={styles.preferenceDescription}>
            Recevoir une notification 30 minutes avant chaque cours
          </Text>
        </View>
        <Switch
          value={courseReminders}
          onValueChange={handleCourseRemindersToggle}
          disabled={isSaving}
          trackColor={{ false: colors.border.light, true: colors.primary[500] }}
          thumbColor={courseReminders ? colors.primary[500] : colors.text.disabled}
        />
      </View>

      {/* Message Notifications Toggle */}
      <View style={[styles.preferenceRow, styles.preferenceRowBottom]}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceLabel}>Messages de l'admin</Text>
          <Text style={styles.preferenceDescription}>
            Recevoir les notifications de messages depuis l'administration
          </Text>
        </View>
        <Switch
          value={messageNotifications}
          onValueChange={handleMessageNotificationsToggle}
          disabled={isSaving}
          trackColor={{ false: colors.border.light, true: colors.primary[500] }}
          thumbColor={messageNotifications ? colors.primary[500] : colors.text.disabled}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  preferenceRowBottom: {
    borderBottomWidth: 0,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  preferenceDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
})
