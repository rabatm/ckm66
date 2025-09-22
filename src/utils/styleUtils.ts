import { StyleSheet } from 'react-native'

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(styles: T): T => {
  return StyleSheet.create(styles)
}