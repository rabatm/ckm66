import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Colors } from '@/constants/Colors'
import { styles } from '../LoginForm.styles'

interface PasswordInputProps {
  value: string
  onChangeText: (text: string) => void
  showPassword: boolean
  onTogglePassword: () => void
  disabled: boolean
}

export const PasswordInput= ({
  value,
  onChangeText,
  showPassword,
  onTogglePassword,
  disabled
}: PasswordInputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Mot de passe</Text>
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        placeholder="Votre mot de passe"
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={onTogglePassword}
        disabled={disabled}
      >
        <Text style={styles.eyeText}>
          {showPassword ? '👁️' : '🙈'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
)