import React, { useCallback } from 'react'

// Note: This is a basic implementation. In a real app, you would use expo-haptics
// For now, we'll create a mock implementation that can be easily replaced

interface HapticOptions {
  type?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'
}

export const useHaptics = () => {
  const triggerHaptic = useCallback((options: HapticOptions = {}) => {
    const { type = 'light' } = options

    // Mock implementation - replace with expo-haptics when available
    console.log(`Haptic feedback: ${type}`)

    // Future implementation would be:
    // import * as Haptics from 'expo-haptics'
    // switch (type) {
    //   case 'light':
    //     return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    //   case 'medium':
    //     return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    //   case 'heavy':
    //     return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    //   case 'selection':
    //     return Haptics.selectionAsync()
    //   case 'success':
    //     return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    //   case 'warning':
    //     return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    //   case 'error':
    //     return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    // }
  }, [])

  const triggerSelection = useCallback(() => {
    triggerHaptic({ type: 'selection' })
  }, [triggerHaptic])

  const triggerImpact = useCallback(
    (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
      triggerHaptic({ type: intensity })
    },
    [triggerHaptic]
  )

  const triggerNotification = useCallback(
    (type: 'success' | 'warning' | 'error') => {
      triggerHaptic({ type })
    },
    [triggerHaptic]
  )

  return {
    triggerHaptic,
    triggerSelection,
    triggerImpact,
    triggerNotification,
  }
}

// Higher-order component for adding haptic feedback to buttons
export const withHaptics = (
  Component: React.ComponentType<any>,
  hapticType: HapticOptions['type'] = 'light'
) => {
  const WrappedComponent = React.forwardRef((props: any, ref: any) => {
    const { triggerHaptic } = useHaptics()

    const handlePress = () => {
      triggerHaptic({ type: hapticType })
      props.onPress?.()
    }

    return React.createElement(Component, { ...props, ref, onPress: handlePress })
  })

  WrappedComponent.displayName = `withHaptics(${Component.displayName || Component.name})`
  return WrappedComponent
}
