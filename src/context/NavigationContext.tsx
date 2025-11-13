import React, { createContext, useContext, useState, useCallback } from 'react'
import type { TabType } from '@/components/ui/DarkTabBar'

type ProfileTabType = 'infos' | 'progression' | 'badges'

interface NavigationContextType {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  navigateToTab: (tab: TabType) => void
  activeProfileTab: ProfileTabType
  setActiveProfileTab: (tab: ProfileTabType) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule')
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabType>('infos')

  const navigateToTab = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        navigateToTab,
        activeProfileTab,
        setActiveProfileTab,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}
