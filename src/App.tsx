import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthScreen } from '@/features/auth/screens/AuthScreen'
import { MainApp } from '@/features/main/screens/MainApp'
import { ThemeProvider } from '@/ui/themes'
import { SafeArea } from '@/ui/layouts'

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

  if (isLoading) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeArea>
    )
  }

  return (
    <SafeArea>
      {isAuthenticated && user ? <MainApp /> : <AuthScreen />}
    </SafeArea>
  )
}

export default function App() {
  console.log('App component rendered')
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
