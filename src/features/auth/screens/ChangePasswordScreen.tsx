
import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography } from '@/theme';
import { supabase } from '@/lib/supabase';

interface ChangePasswordScreenProps {
  onSuccess: () => void;
  userId: string;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  onSuccess,
  userId,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (!password || !confirmPassword) {
      setValidationError('Les deux mots de passe sont requis');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (password.length < 6) {
      setValidationError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      await supabase
        .from('profiles')
        .update({ is_new_user: false })
        .eq('id', userId);

      Alert.alert(
        'Mot de passe changé',
        'Votre mot de passe a été changé avec succès.',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de changer le mot de passe. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={48} color={colors.primary[500]} />
            </View>

            <Text style={styles.title}>Changer le mot de passe</Text>
            <Text style={styles.subtitle}>
              Veuillez choisir un nouveau mot de passe.
            </Text>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, validationError && styles.inputError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Nouveau mot de passe"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor={colors.text.disabled}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, validationError && styles.inputError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor={colors.text.disabled}
                />
              </View>
              {validationError && <Text style={styles.errorMessage}>{validationError}</Text>}
            </View>

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
                  <Text style={styles.buttonText}>Changer le mot de passe</Text>
                  <Ionicons name="save" size={20} color={colors.text.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
};

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
  });
