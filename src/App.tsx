import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthScreen } from '@/features/auth/screens/AuthScreen'
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen'
import { MainApp } from '@/features/main/screens/MainApp'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
})

function AppContent() {
  console.log('AppContent rendered')
  const { user, isLoading, isAuthenticated } = useAuth()
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkProfile() {
      if (!user?.id) {
        setNeedsOnboarding(null)
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle()

        // User needs onboarding if profile doesn't exist or is incomplete
        const incomplete = !profile || !profile.first_name || !profile.last_name
        setNeedsOnboarding(incomplete)
      } catch (error) {
        console.error('Error checking profile:', error)
        setNeedsOnboarding(false)
      }
    }

    checkProfile()
  }, [user?.id])

  if (isLoading || (isAuthenticated && needsOnboarding === null)) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    )
  }

  // Show onboarding if authenticated but profile is incomplete
  if (isAuthenticated && user && needsOnboarding) {
    return (
      <View style={styles.container}>
        <OnboardingScreen
          userId={user.id}
          email={user.email || ''}
          onComplete={() => setNeedsOnboarding(false)}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {isAuthenticated && user ? <MainApp /> : <AuthScreen />}
    </View>
  )
}

export default function App() {
  console.log('App component rendered')
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
})
