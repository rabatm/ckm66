import React, { useState } from 'react'
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
import { useAuth } from '../hooks/useAuth'
import { colors, spacing, typography } from '@/theme'

interface ForgotPasswordScreenProps {
  onBack: () => void
  onSuccess: () => void
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { resetPassword, isLoading } = useAuth()

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setValidationError('Email requis')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setValidationError("Format d'email invalide")
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validateEmail(email)) return

    try {
      await resetPassword(email)
      Alert.alert(
        'Email envoyé',
        'Vérifiez votre boîte email pour le lien de réinitialisation de mot de passe.',
        [{ text: 'OK', onPress: onSuccess }]
      )
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer l\'email. Vérifiez que l\'adresse email est correcte.'
      )
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Card */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={48} color={colors.primary[500]} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre
              mot de passe.
            </Text>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, validationError && styles.inputError]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (validationError) setValidationError(null)
                  }}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor={colors.text.disabled}
                />
              </View>
              {validationError && <Text style={styles.errorMessage}>{validationError}</Text>}
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
                  <Text style={styles.buttonText}>Envoyer le lien</Text>
                  <Ionicons name="send" size={20} color={colors.text.primary} />
                </View>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={onBack}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={16} color={colors.text.tertiary} />
              <Text style={styles.backToLoginText}>Retour à la connexion</Text>
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
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
    marginBottom: spacing.xl,
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
  errorMessage: {
    color: colors.error,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  backToLoginText: {
    color: colors.text.tertiary,
    fontSize: typography.sizes.sm,
  },
})
