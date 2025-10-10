import React from 'react'
import { View, StyleSheet, ImageBackground } from 'react-native'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { colors } from '@/theme'

const loginBackground = require('@/assets/login-bg.png') as number

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
      {/* Background Image */}
      <ImageBackground source={loginBackground} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />
      </ImageBackground>

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
