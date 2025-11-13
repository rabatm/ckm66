import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBadges } from '@/features/profile/hooks/useBadges'
import { useUnreadMessages } from '@/features/messaging/hooks/useUnreadMessages'
import { useNavigation } from '@/context/NavigationContext'
import { ScheduleScreen } from '@/features/schedule/screens/ScheduleScreen'
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen'
import { MessagesScreen } from '@/features/messaging/screens/MessagesScreen'
import { ReservationsScreen } from '@/features/schedule/screens/ReservationsScreen'
import { DarkTabBar } from '@/components/ui/DarkTabBar'
import { DarkAppHeader } from '@/components/ui/DarkAppHeader'
import { colors } from '@/theme'

export const MainApp = () => {
  const { user } = useAuth()
  const { userProgress } = useBadges()
  const { unreadCount } = useUnreadMessages()
  const { activeTab, setActiveTab } = useNavigation()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleScreen />
      case 'reservations':
        return <ReservationsScreen />
      case 'messages':
        return <MessagesScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <ScheduleScreen />
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Glass App Header */}
      <DarkAppHeader
        {...(user?.first_name ? { firstName: user.first_name } : {})}
        {...(user?.profile_picture_url ? { profilePictureUrl: user.profile_picture_url } : {})}
        {...(userProgress?.current_level ? { level: userProgress.current_level } : {})}
        {...(userProgress?.total_points !== undefined
          ? { totalPoints: userProgress.total_points }
          : {})}
      />

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Glass Tab Bar */}
      <DarkTabBar activeTab={activeTab} onTabChange={setActiveTab} unreadMessagesCount={unreadCount} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
})
