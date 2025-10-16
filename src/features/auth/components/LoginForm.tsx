import React, { useState } from 'react'
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '../types/auth.types'
import { colors, spacing, typography } from '@/theme'

interface LoginFormProps {
  onLoginSuccess?: () => void
  onForgotPassword?: () => void
}

export const LoginForm = ({ onLoginSuccess, onForgotPassword }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

  const { signIn, isLoading, error, clearError } = useAuth()

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    if (error) clearError()
    setFormData((prev) => ({ ...prev, [field]: value }))

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
        errors.email = "Format d'email invalide"
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
    } catch {
      // Error handled in useAuth hook
    }
  }

  const handleForgotPassword = () => {
    onForgotPassword?.()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Spacer for logo in background */}
        <View style={styles.logoSpacer} />

        {/* Login Card with Glassmorphism */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Connexion</Text>

            {error && (
              <BlurView intensity={10} tint="dark" style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </BlurView>
            )}

            {/* Email Input with Icon */}
            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, validationErrors.email && styles.inputError]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor={colors.text.disabled}
                />
              </View>
              {validationErrors.email && (
                <Text style={styles.errorMessage}>{validationErrors.email}</Text>
              )}
            </View>

            {/* Password Input with Icon */}
            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, validationErrors.password && styles.inputError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Mot de passe"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  placeholderTextColor={colors.text.disabled}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.password && (
                <Text style={styles.errorMessage}>{validationErrors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.primary} size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.text.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.footerText}>Besoin d'aide ? Contactez votre instructeur</Text>
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
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  logoSpacer: {
    flex: 1,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    padding: spacing['2xl'],
  },
  cardTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    overflow: 'hidden',
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    height: '100%',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  passwordInput: {
    paddingRight: spacing.xl,
  },
  eyeButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  errorMessage: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    color: colors.primary[500],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing['3xl'],
  },
  footerText: {
    color: colors.text.tertiary,
    fontSize: typography.sizes.xs,
  },
})
