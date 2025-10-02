import { StyleSheet } from 'react-native'
import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { shadows } from './shadows'

/**
 * Global Styles - Styles réutilisables pour toute l'application
 * Utilisez ces styles pour maintenir la cohérence du design
 */

export const globalStyles = StyleSheet.create({
  // ==================== CONTAINERS ====================
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  containerWithPadding: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },

  scrollView: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },

  // ==================== SECTIONS ====================
  section: {
    padding: spacing.lg,
  },

  sectionWithoutTop: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  // ==================== CARDS ====================
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },

  cardElevated: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.md,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },

  cardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  // ==================== BUTTONS ====================
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  buttonSecondary: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonSecondaryText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonOutlineText: {
    color: colors.primary[500],
    fontSize: 16,
    fontWeight: '600',
  },

  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  buttonSmallText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ==================== INPUTS ====================
  inputWrapper: {
    marginBottom: spacing.md,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },

  inputError: {
    borderColor: colors.error,
  },

  inputFocused: {
    borderColor: colors.primary[500],
  },

  // ==================== TEXT STYLES ====================
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },

  bodyText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  bodyTextPrimary: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },

  caption: {
    fontSize: 12,
    color: colors.text.tertiary,
  },

  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },

  successText: {
    fontSize: 14,
    color: colors.success,
  },

  // ==================== BADGES ====================
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  badgePrimary: {
    backgroundColor: `${colors.primary[500]}20`,
  },

  badgePrimaryText: {
    color: colors.primary[500],
  },

  badgeSuccess: {
    backgroundColor: `${colors.success}20`,
  },

  badgeSuccessText: {
    color: colors.success,
  },

  badgeWarning: {
    backgroundColor: `${colors.warning}20`,
  },

  badgeWarningText: {
    color: colors.warning,
  },

  badgeError: {
    backgroundColor: `${colors.error}20`,
  },

  badgeErrorText: {
    color: colors.error,
  },

  // ==================== DIVIDERS ====================
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },

  dividerThick: {
    height: 2,
    backgroundColor: colors.border.dark,
    marginVertical: spacing.lg,
  },

  // ==================== MODALS ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },

  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseButtonText: {
    fontSize: 32,
    color: colors.text.secondary,
    lineHeight: 32,
  },

  // ==================== LISTS ====================
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  listItemLast: {
    borderBottomWidth: 0,
  },

  listItemContent: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },

  listItemSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  // ==================== EMPTY STATES ====================
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  emptyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  // ==================== LOADING STATES ====================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },

  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },

  // ==================== ERROR STATES ====================
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },

  errorBanner: {
    backgroundColor: `${colors.error}20`,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },

  errorBannerText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },

  // ==================== HEADER & NAVIGATION ====================
  header: {
    backgroundColor: colors.primary[500],
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 16,
    color: `${colors.text.primary}cc`, // 80% opacity
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: colors.primary[500],
  },

  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },

  tabTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },

  // ==================== SPACING UTILITIES ====================
  mt0: { marginTop: 0 },
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },

  mb0: { marginBottom: 0 },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },

  mx0: { marginHorizontal: 0 },
  mx1: { marginHorizontal: spacing.xs },
  mx2: { marginHorizontal: spacing.sm },
  mx3: { marginHorizontal: spacing.md },
  mx4: { marginHorizontal: spacing.lg },
  mx5: { marginHorizontal: spacing.xl },

  my0: { marginVertical: 0 },
  my1: { marginVertical: spacing.xs },
  my2: { marginVertical: spacing.sm },
  my3: { marginVertical: spacing.md },
  my4: { marginVertical: spacing.lg },
  my5: { marginVertical: spacing.xl },

  p0: { padding: 0 },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },

  // ==================== FLEXBOX UTILITIES ====================
  row: {
    flexDirection: 'row',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  column: {
    flexDirection: 'column',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  alignCenter: {
    alignItems: 'center',
  },

  alignStart: {
    alignItems: 'flex-start',
  },

  alignEnd: {
    alignItems: 'flex-end',
  },

  justifyCenter: {
    justifyContent: 'center',
  },

  justifyBetween: {
    justifyContent: 'space-between',
  },

  justifyAround: {
    justifyContent: 'space-around',
  },

  flex1: {
    flex: 1,
  },

  // ==================== ICON CONTAINERS ====================
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerPrimary: {
    backgroundColor: `${colors.primary[500]}20`,
  },

  // ==================== DETAIL ROWS (for info displays) ====================
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  detailRowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
})

/**
 * Export des couleurs et autres utilitaires
 */
export { colors, typography, spacing, shadows }
