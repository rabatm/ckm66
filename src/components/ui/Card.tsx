// src/components/ui/Card.tsx
import React from 'react'
import { View, ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-gray-800 shadow-lg elevation-4'
      case 'outlined':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      default:
        return 'bg-white dark:bg-gray-800'
    }
  }

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'sm':
        return 'p-3'
      case 'md':
        return 'p-4'
      case 'lg':
        return 'p-6'
      default:
        return 'p-4'
    }
  }

  return (
    <View
      className={`
        rounded-xl
        ${getVariantClasses()}
        ${getPaddingClasses()}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  )
}
