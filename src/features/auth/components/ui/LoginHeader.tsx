import React from 'react'
import { View, Text } from 'react-native'
import { styles } from '../LoginForm.styles'


export const LoginHeader = () => (
  <View style={styles.header}>
    <Text style={styles.title}>Connexion</Text>
    <Text style={styles.subtitle}>
      Connectez-vous à votre compte Krav Maga
    </Text>
  </View>
)