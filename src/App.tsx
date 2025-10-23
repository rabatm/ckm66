import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthScreen } from '@/features/auth/screens/AuthScreen'
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen'
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen'
import { ChangePasswordScreen } from '@/features/auth/screens/ChangePasswordScreen'
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen'
import { MainApp } from '@/features/main/screens/MainApp'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme'
import { registerForPushNotifications } from '@/services/pushNotifications'

const loginBackground = require('@/assets/login-bg.png') as number

type AuthScreenType = 'login' | 'forgot-password' | 'reset-password'

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
  const [needsPasswordChange, setNeedsPasswordChange] = useState<boolean | null>(null)
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('login')

  // Handle deep link URLs (must be defined before useEffect that uses it)
  const handleDeepLink = (url: string) => {
    console.log('Deep link received:', url)

    // Parse the URL to check if it's a password reset link
    if (url.includes('reset-password') || url.includes('type=recovery')) {
      console.log('Password reset link detected')
      setAuthScreen('reset-password')
    }
  }

  // Listen for deep links (e.g., password reset links)
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL()
      if (url) {
        handleDeepLink(url)
      }
    }

    // Handle URL events when app is already open
    const subscription = Linking.addEventListener('url', (event: { url: string }) => {
      handleDeepLink(event.url)
    })

    handleInitialURL()

    return () => {
      subscription.remove()
    }
  }, [])

  // Setup push notifications when authenticated
  useEffect(() => {
    const setupPushNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        console.log('👤 Utilisateur connecté, enregistrement pour les notifications...')
        await registerForPushNotifications()
      } else {
        console.log('ℹ️ Utilisateur non connecté, notifications désactivées')
      }
    }

    setupPushNotifications()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Connexion détectée, enregistrement pour les notifications')
          await registerForPushNotifications()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Setup notification listeners once on mount
  useEffect(() => {
    // Listen for incoming notifications
    const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification reçue:', notification.request.content.title)
    })

    // Listen for notification taps
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data as Record<string, any>
        console.log('👆 Notification tapée, data:', data)

        if (data.type === 'admin_message' && data.messageId) {
          const { recordMessageRead } = await import('@/services/pushNotifications')
          await recordMessageRead(data.messageId as string)
        }
      }
    )

    return () => {
      notificationSubscription.remove()
      responseSubscription.remove()
    }
  }, [])

  useEffect(() => {
    async function checkProfile() {
      if (!user?.id) {
        setNeedsOnboarding(null)
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, is_new_user')
          .eq('id', user.id)
          .maybeSingle()

        // User needs onboarding if profile doesn't exist or is incomplete
        const incomplete = !profile || !profile.first_name || !profile.last_name
        setNeedsOnboarding(incomplete)

        if (profile?.is_new_user) {
          setNeedsPasswordChange(true)
        } else {
          setNeedsPasswordChange(false)
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        setNeedsOnboarding(false)
        setNeedsPasswordChange(false)
      }
    }

    checkProfile()
  }, [user?.id])

  if (isLoading || (isAuthenticated && (needsOnboarding === null || needsPasswordChange === null))) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    )
  }

  // Show change password screen if authenticated and is a new user
  if (isAuthenticated && user && needsPasswordChange) {
    return (
      <View style={styles.container}>
        <ChangePasswordScreen
          userId={user.id}
          onSuccess={() => setNeedsPasswordChange(false)}
        />
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

  // Render authenticated screens
  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={colors.background.primary} />
        <MainApp />
      </View>
    )
  }

  // Render auth screens with background
  const renderAuthScreen = () => {
    switch (authScreen) {
      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onBack={() => setAuthScreen('login')}
            onSuccess={() => setAuthScreen('login')}
          />
        )
      case 'reset-password':
        return (
          <ResetPasswordScreen
            onSuccess={() => setAuthScreen('login')}
            onCancel={() => setAuthScreen('login')}
          />
        )
      default:
        return <AuthScreen onShowForgotPassword={() => setAuthScreen('forgot-password')} />
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.background.primary} />

      {/* Background Image for auth screens */}
      <ImageBackground source={loginBackground} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Auth Screen Content */}
      <View style={styles.content}>{renderAuthScreen()}</View>
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
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
  },
})
