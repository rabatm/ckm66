import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { styles } from '../LoginForm.styles'

interface ForgotPasswordLinkProps {
  onPress: () => void
  disabled: boolean
}

export const ForgotPasswordLink: React.FC<ForgotPasswordLinkProps> = ({ onPress, disabled }) => (
  <TouchableOpacity style={styles.forgotPasswordLink} onPress={onPress} disabled={disabled}>
    <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
  </TouchableOpacity>
)
