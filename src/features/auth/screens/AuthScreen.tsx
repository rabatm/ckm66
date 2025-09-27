import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

export const AuthScreen = () => {
  const { resetPassword } = useAuth()

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword(email)
      // You might want to show a success message here
    } catch (error) {
      // Error is already handled in the hook
    }
  }

  const handleLoginSuccess = () => {
    // Navigation to main app is handled automatically in App.tsx
  }

  return (
    <View style={styles.container}>
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={handleForgotPassword}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})