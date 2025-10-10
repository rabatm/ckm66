import * as Calendar from 'expo-calendar'
import { Alert, Platform } from 'react-native'

export interface CalendarEvent {
  title: string
  startDate: Date
  endDate: Date
  location?: string
  notes?: string
}

/**
 * Request calendar permissions
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync()
    return status === 'granted'
  } catch (error) {
    console.error('Error requesting calendar permissions:', error)
    return false
  }
}

/**
 * Get default calendar for the platform
 */
export async function getDefaultCalendar(): Promise<Calendar.Calendar | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)

    // On iOS, prefer the default calendar
    if (Platform.OS === 'ios') {
      const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0]
      return defaultCalendar || null
    }

    // On Android, prefer the first writable calendar
    const writableCalendars = calendars.filter((cal) => cal.allowsModifications)
    return writableCalendars[0] || null
  } catch (error) {
    console.error('Error getting calendars:', error)
    return null
  }
}

/**
 * Add event to calendar
 */
export async function addEventToCalendar(event: CalendarEvent): Promise<boolean> {
  try {
    // Request permissions first
    const hasPermission = await requestCalendarPermissions()
    if (!hasPermission) {
      Alert.alert(
        'Permission requise',
        "L'accès au calendrier est nécessaire pour ajouter des événements. Veuillez autoriser l'accès dans les paramètres.",
        [{ text: 'OK' }]
      )
      return false
    }

    // Get default calendar
    const calendar = await getDefaultCalendar()
    if (!calendar) {
      Alert.alert(
        'Erreur',
        "Impossible d'accéder au calendrier. Vérifiez que vous avez un calendrier configuré.",
        [{ text: 'OK' }]
      )
      return false
    }

    // Create event details
    const eventDetails = {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location || null,
      notes: event.notes || '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    // Add event to calendar
    const eventId = await Calendar.createEventAsync(calendar.id, eventDetails)

    if (eventId) {
      Alert.alert('Succès', "L'événement a été ajouté à votre calendrier !", [{ text: 'OK' }])
      return true
    } else {
      Alert.alert('Erreur', "Impossible d'ajouter l'événement au calendrier.", [{ text: 'OK' }])
      return false
    }
  } catch (error) {
    console.error('Error adding event to calendar:', error)
    Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout au calendrier.", [
      { text: 'OK' },
    ])
    return false
  }
}

/**
 * Create calendar event from course reservation
 */
export function createCalendarEventFromReservation(
  courseTitle: string,
  reservationDate: string,
  startTime: string,
  endTime: string,
  location?: string
): CalendarEvent {
  const startDateTime = new Date(`${reservationDate}T${startTime}`)
  const endDateTime = new Date(`${reservationDate}T${endTime}`)

  return {
    title: `Cours: ${courseTitle}`,
    startDate: startDateTime,
    endDate: endDateTime,
    location: location || 'Salle de sport CKM66',
    notes: "Réservation automatique depuis l'app CKM66",
  }
}
