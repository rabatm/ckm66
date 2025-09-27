import React, { useState } from 'react'
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '../types/auth.types'
import { styles } from './LoginForm.styles'
import {
  EmailInput,
  PasswordInput,
  LoginButton,
  ErrorDisplay,
  ForgotPasswordLink,
  LoginHeader,
} from './ui'

interface LoginFormProps {
  onLoginSuccess?: () => void
  onForgotPassword?: (email: string) => void
}

export const LoginForm =  ({
  onLoginSuccess,
  onForgotPassword,
}: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, isLoading, error, clearError } = useAuth()

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    if (error) clearError()
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string | null => {
    if (!formData.email.trim()) {
      return 'Veuillez saisir votre email'
    }

    if (!formData.password.trim()) {
      return 'Veuillez saisir votre mot de passe'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Veuillez saisir un email valide'
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      Alert.alert('Erreur', validationError)
      return
    }

    try {
      await signIn(formData)
      onLoginSuccess?.()
    } catch (error) {
      // Error handled in useAuth hook
    }
  }

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      Alert.alert(
        'Email requis',
        'Veuillez saisir votre email pour réinitialiser votre mot de passe'
      )
      return
    }
    onForgotPassword?.(formData.email)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        <LoginHeader />
        
        {error && <ErrorDisplay error={error} />}
        
        <EmailInput 
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          disabled={isLoading}
        />
        
        <PasswordInput
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        />

        <ForgotPasswordLink 
          onPress={handleForgotPassword}
          disabled={isLoading}
        />

        <LoginButton
          onPress={handleSubmit}
          isLoading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
