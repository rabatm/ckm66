/**
 * Theme System - Dark Mode Krav Maga
 */

export { colors } from './colors'
export { typography } from './typography'
export { spacing } from './spacing'
export { shadows } from './shadows'
export { globalStyles } from './globalStyles'

import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { shadows } from './shadows'
import { globalStyles } from './globalStyles'

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  globalStyles,
}

export type Theme = typeof theme
