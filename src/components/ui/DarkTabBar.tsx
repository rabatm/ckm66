import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type TabType = 'schedule' | 'reservations' | 'accomplishments' | 'profile'

interface TabConfig {
  key: TabType
  label: string
  icon: keyof typeof Ionicons.glyphMap
}

interface DarkTabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const TABS: TabConfig[] = [
  {
    key: 'schedule',
    label: 'Cours',
    icon: 'calendar-outline',
  },
  {
    key: 'reservations',
    label: 'Réservations',
    icon: 'list-outline',
  },
  {
    key: 'accomplishments',
    label: 'Badges',
    icon: 'trophy-outline',
  },
  {
    key: 'profile',
    label: 'Profil',
    icon: 'person-outline',
  },
]

/**
 * iOS-style glass design tab bar with blur effect
 */
export const DarkTabBar: React.FC<DarkTabBarProps> = ({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View
          style={[
            styles.innerContainer,
            {
              paddingBottom: Math.max(insets.bottom, spacing.sm),
            },
          ]}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => onTabChange(tab.key)}
                activeOpacity={0.6}
              >
                <View style={styles.tabContent}>
                  {/* Icon */}
                  <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                    <Ionicons
                      name={tab.icon}
                      size={24}
                      color={isActive ? colors.primary[500] : colors.text.tertiary}
                    />
                  </View>

                  {/* Label */}
                  <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>

                  {/* Active indicator dot */}
                  {isActive && <View style={styles.activeDot} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(185, 28, 28, 0.3)', // Rouge sombre avec transparence
    backgroundColor: 'rgba(26, 32, 44, 0.7)', // Semi-transparent dark
    // Shadow for depth
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(185, 28, 28, 0.15)', // Rouge très subtil
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  labelActive: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
})
