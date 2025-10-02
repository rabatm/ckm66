import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, shadows } from '@/theme'

interface DarkCardProps {
  children: React.ReactNode
  style?: ViewStyle
  noPadding?: boolean
}

export const DarkCard: React.FC<DarkCardProps> = ({
  children,
  style,
  noPadding,
}) => {
  return (
    <View style={[
      styles.card,
      noPadding && styles.noPadding,
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.dark,
    ...shadows.md,
  },
  noPadding: {
    padding: 0,
  },
})
