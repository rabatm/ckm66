import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { supabase } from '@/lib/supabase'
import { AuthService } from '../services/auth.service'
import { colors, spacing, typography } from '@/theme'

interface ResetPasswordScreenProps {
  onSuccess: () => void
  onCancel: () => void
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    // Check if we have a valid session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        Alert.alert(
          'Lien invalide',
          'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.',
          [{ text: 'OK', onPress: onCancel }]
        )
      }
    }

    checkSession()
  }, [onCancel])

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {}

    if (!password.trim()) {
      errors.password = 'Mot de passe requis'
    } else if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Confirmation requise'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      await AuthService.updatePassword(password)

      Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès.', [
        { text: 'OK', onPress: onSuccess },
      ])
    } catch (error) {
      console.error('Error updating password:', error)
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Card */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={colors.primary[500]} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </Text>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View
                style={[styles.inputContainer, validationErrors.password && styles.inputError]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (validationErrors.password) {
                      const { password, ...rest } = validationErrors
                      setValidationErrors(rest)
                    }
                  }}
                  placeholder="Nouveau mot de passe"
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

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <View
                style={[
                  styles.inputContainer,
                  validationErrors.confirmPassword && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (validationErrors.confirmPassword) {
                      const { confirmPassword, ...rest } = validationErrors
                      setValidationErrors(rest)
                    }
                  }}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  placeholderTextColor={colors.text.disabled}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text style={styles.errorMessage}>{validationErrors.confirmPassword}</Text>
              )}
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.requirementsText}>Minimum 8 caractères requis</Text>
            </View>

            {/* Submit Button */}
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
                  <Text style={styles.buttonText}>Modifier le mot de passe</Text>
                  <Ionicons name="checkmark" size={20} color={colors.text.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
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
    paddingHorizontal: spacing.xl,
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
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
  passwordInput: {
    paddingRight: spacing.xl,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
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
  requirementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  requirementsText: {
    color: colors.text.tertiary,
    fontSize: typography.sizes.xs,
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
})
