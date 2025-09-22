import React from 'react'
import { View, Text } from 'react-native'
import { styles } from '../LoginForm.styles'

interface ErrorDisplayProps {
  error: string
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
  </View>
)
