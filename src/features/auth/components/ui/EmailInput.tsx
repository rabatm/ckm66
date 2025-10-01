import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { Colors } from '@/constants/Colors'
import { styles } from '../LoginForm.styles'

interface EmailInputProps {
  value: string
  onChangeText: (text: string) => void
  disabled: boolean
}

export const EmailInput = ({ value, onChangeText, disabled }: EmailInputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Email</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder="votre@email.com"
      placeholderTextColor={Colors.textSecondary}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      editable={!disabled}
    />
  </View>
)
