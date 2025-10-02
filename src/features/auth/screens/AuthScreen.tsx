import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { colors } from '@/theme'

export const AuthScreen = () => {
  const { resetPassword } = useAuth()

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword(email)
      // You might want to show a success message here
    } catch {
      // Error is already handled in the hook
    }
  }

  const handleLoginSuccess = () => {
    // Navigation to main app is handled automatically in App.tsx
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.overlay} />
      </LinearGradient>
      <View style={styles.content}>
        <LoginForm onLoginSuccess={handleLoginSuccess} onForgotPassword={handleForgotPassword} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 32, 44, 0.85)',
  },
  content: {
    flex: 1,
  },
})
