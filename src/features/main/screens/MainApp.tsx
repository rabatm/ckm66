import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBadges } from '@/features/profile/hooks/useBadges'
import { ScheduleScreen } from '@/features/schedule/screens/ScheduleScreen'
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen'
import { AccomplissementsScreen } from '@/features/profile/screens/AccomplissementsScreen'
import { ReservationsScreen } from '@/features/schedule/screens/ReservationsScreen'
import { DarkTabBar, type TabType } from '@/components/ui/DarkTabBar'
import { DarkAppHeader } from '@/components/ui/DarkAppHeader'
import { colors } from '@/theme'

export const MainApp = () => {
  const { user } = useAuth()
  const { userProgress } = useBadges()
  const [activeTab, setActiveTab] = useState<TabType>('schedule')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleScreen />
      case 'accomplishments':
        return <AccomplissementsScreen />
      case 'reservations':
        return <ReservationsScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <ScheduleScreen />
    }
  }

  return (
    <View style={styles.container}>
      {/* Glass App Header */}
      <DarkAppHeader
        firstName={user?.first_name}
        profilePictureUrl={user?.profile_picture_url}
        level={userProgress?.current_level}
        totalPoints={userProgress?.total_points}
      />

      {/* Tab Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Glass Tab Bar */}
      <DarkTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
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
