import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ScheduleScreen } from '@/features/schedule/screens/ScheduleScreen'
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen'

type TabType = 'schedule' | 'profile'

export const MainApp = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('schedule')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <ScheduleScreen />
    }
  }

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CKM66</Text>
        <Text style={styles.subtitle}>Bonjour {user?.first_name} 👋</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            📅 Cours
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            👤 Profil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#DBEAFE',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
})

