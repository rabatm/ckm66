import { StyleSheet } from 'react-native'

/**
 * Utility to create typed styles
 * This is a simple wrapper around StyleSheet.create for better type inference
 */
export function createStyles<T extends StyleSheet.NamedStyles<T>>(styles: T): T {
  return StyleSheet.create(styles)
}
