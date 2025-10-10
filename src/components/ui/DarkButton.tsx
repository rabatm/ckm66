import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { colors, typography, spacing } from '@/theme'

interface DarkButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
  onPress?: () => void
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export const DarkButton: React.FC<DarkButtonProps> = ({
  variant = 'primary',
  children,
  onPress,
  loading,
  disabled,
  icon,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    (disabled || loading) && styles.disabled,
    style,
  ]

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'ghost' && styles.ghostText,
    textStyle,
  ]

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.primary : colors.primary[500]}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.text.tertiary,
  },
})
