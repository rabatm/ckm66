import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { styles } from '../LoginForm.styles'

interface LoginButtonProps {
  onPress: () => void
  isLoading: boolean
}

export const LoginButton: React.FC<LoginButtonProps> = ({ onPress, isLoading }) => (
  <TouchableOpacity
    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
    onPress={onPress}
    disabled={isLoading}
  >
    <Text style={styles.loginButtonText}>
      {isLoading ? 'Connexion...' : 'Se connecter'}
    </Text>
  </TouchableOpacity>
)