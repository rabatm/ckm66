import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../LoginForm.styles'

interface RegisterSectionProps {
  onNavigateToRegister?: () => void
  disabled: boolean
}

export const RegisterSection = ({ 
  onNavigateToRegister, 
  disabled 
} : RegisterSectionProps) => (
  <View style={styles.registerSection}>
    <Text style={styles.registerText}>Pas encore de compte ? </Text>
    <TouchableOpacity
      onPress={onNavigateToRegister}
      disabled={disabled}
    >
      <Text style={styles.registerLink}>S'inscrire</Text>
    </TouchableOpacity>
  </View>
)