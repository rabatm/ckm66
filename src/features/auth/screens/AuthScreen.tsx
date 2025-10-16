import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LoginForm } from '../components/LoginForm'

interface AuthScreenProps {
  onShowForgotPassword: () => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onShowForgotPassword }) => {
  const handleLoginSuccess = () => {
    // Navigation to main app is handled automatically in App.tsx
  }

  return (
    <View style={styles.container}>
      <LoginForm onLoginSuccess={handleLoginSuccess} onForgotPassword={onShowForgotPassword} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
