// src/components/ui/Button.tsx
import React from 'react'
import { Pressable, Text, PressableProps } from 'react-native'

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-500 active:bg-primary-600'
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
      case 'outline':
        return 'border-2 border-primary-500 bg-transparent active:bg-primary-50'
      case 'ghost':
        return 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800'
      default:
        return 'bg-primary-500 active:bg-primary-600'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2'
      case 'md':
        return 'px-4 py-3'
      case 'lg':
        return 'px-6 py-4'
      default:
        return 'px-4 py-3'
    }
  }

  const getTextClasses = () => {
    const baseClasses = 'font-semibold text-center'

    if (variant === 'primary') {
      return `${baseClasses} text-white`
    }
    if (variant === 'outline' || variant === 'ghost') {
      return `${baseClasses} text-primary-500`
    }
    return `${baseClasses} text-gray-900 dark:text-white`
  }

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-base'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-base'
    }
  }

  return (
    <Pressable
      className={`
        rounded-xl items-center justify-center
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled || isLoading ? 'opacity-50' : ''}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      <Text className={`${getTextClasses()} ${getTextSizeClasses()}`}>
        {isLoading ? 'Chargement...' : children}
      </Text>
    </Pressable>
  )
}
