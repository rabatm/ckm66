import { createStyles } from '@/utils/styleUtils'
import { Colors } from '@/constants/Colors'
import { Spacing } from '@/constants/Spacing'
import { Typography } from '@/constants/Typography'

export const styles = createStyles({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.errorBackground,
    borderColor: Colors.errorBorder,
    borderWidth: 1,
    borderRadius: Spacing.xs,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    ...Typography.caption,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  eyeText: {
    fontSize: 18,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    color: Colors.primary,
    ...Typography.labelSmall,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.xs,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  loginButtonText: {
    color: Colors.onPrimary,
    ...Typography.buttonLarge,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  registerLink: {
    color: Colors.primary,
    ...Typography.labelSmall,
  },
})
