import React, { useState } from 'react'
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '../types/auth.types'
import { Card, ErrorState } from '@/ui/components/molecules'
import { Button, Input, Typography } from '@/ui/components/atoms'
import { spacing } from '@/ui/tokens'
import { useTheme } from '@/ui/themes'

interface LoginFormProps {
  onLoginSuccess?: () => void
  onForgotPassword?: (email: string) => void
}

export const LoginForm = ({ onLoginSuccess, onForgotPassword }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

  const { signIn, isLoading, error, clearError } = useAuth()
  const { theme } = useTheme()

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    if (error) clearError()
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field-specific validation error
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {}

    if (!formData.email.trim()) {
      errors.email = 'Email requis'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Format d\'email invalide'
      }
    }

    if (!formData.password.trim()) {
      errors.password = 'Mot de passe requis'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await signIn(formData)
      onLoginSuccess?.()
    } catch (error) {
      // Error handled in useAuth hook
    }
  }

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      setValidationErrors({ email: 'Email requis pour la réinitialisation' })
      return
    }
    onForgotPassword?.(formData.email)
  }

  const renderPasswordIcon = () => (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      {showPassword ? (
        // Eye slash icon (hide)
        <>
          <View style={{
            width: 18,
            height: 12,
            borderWidth: 1,
            borderColor: theme.colors.textSecondary,
            borderRadius: 9,
            position: 'relative',
          }} />
          <View style={{
            width: 6,
            height: 6,
            backgroundColor: theme.colors.textSecondary,
            borderRadius: 3,
            position: 'absolute',
          }} />
          <View style={{
            width: 20,
            height: 1,
            backgroundColor: theme.colors.textSecondary,
            position: 'absolute',
            transform: [{ rotate: '45deg' }],
          }} />
        </>
      ) : (
        // Eye icon (show)
        <>
          <View style={{
            width: 18,
            height: 12,
            borderWidth: 1,
            borderColor: theme.colors.textSecondary,
            borderRadius: 9,
          }} />
          <View style={{
            width: 6,
            height: 6,
            backgroundColor: theme.colors.textSecondary,
            borderRadius: 3,
            position: 'absolute',
          }} />
        </>
      )}
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            CKM66
          </Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Krav Maga Perpignan
          </Typography>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Typography variant="h3" style={styles.cardTitle}>
            Connexion
          </Typography>

          {/* Global Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Typography variant="bodySmall" style={styles.errorText}>
                {error}
              </Typography>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputWrapper}>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="votre.email@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isLoading}
              {...(validationErrors.email && { error: validationErrors.email })}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputWrapper}>
            <Input
              label="Mot de passe"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Votre mot de passe"
              secureTextEntry={!showPassword}
              disabled={isLoading}
              {...(validationErrors.password && { error: validationErrors.password })}
              icon={renderPasswordIcon()}
              onIconPress={() => setShowPassword(!showPassword)}
            />
          </View>

          {/* Forgot Password */}
          <View style={styles.forgotPasswordContainer}>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleForgotPassword}
              state={isLoading ? 'disabled' : 'default'}
            >
              Mot de passe oublié ?
            </Button>
          </View>

          {/* Login Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            state={isLoading ? 'loading' : 'default'}
          >
            Se connecter
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typography variant="caption" color="secondary" align="center">
            Besoin d'aide ? Contactez votre instructeur
          </Typography>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#FF6B1A',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing[6],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing[6],
    color: '#0F172A',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: spacing[4],
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing[6],
    marginTop: -spacing[1],
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[8],
    opacity: 0.6,
  },
})
