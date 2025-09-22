// src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type {
  AuthUser,
  AuthSession,
  AuthState,
  AuthError,
  AuthCredentials,
  AuthRegistration,
  PasswordResetRequest,
  PasswordUpdateRequest,
  EmailUpdateRequest,
} from '@/@types';

/**
 * Main authentication hook following AGEND.md principles
 * Provides clean interface for auth operations
 */
export function useAuth() {
  // Selectors for auth state
  const user = useAppStore((state) => state.user);
  const session = useAppStore((state) => state.session);
  const authState = useAppStore((state) => state.authState);
  const authError = useAppStore((state) => state.authError);

  // Auth actions
  const signIn = useAppStore((state) => state.signIn);
  const signUp = useAppStore((state) => state.signUp);
  const signOut = useAppStore((state) => state.signOut);
  const resetPassword = useAppStore((state) => state.resetPassword);
  const updatePassword = useAppStore((state) => state.updatePassword);
  const updateEmail = useAppStore((state) => state.updateEmail);
  const refreshSession = useAppStore((state) => state.refreshSession);
  const clearAuthError = useAppStore((state) => state.clearAuthError);

  // Derived state following clean code principles
  const isAuthenticated = authState === 'authenticated' && user !== null;
  const isLoading = authState === 'loading';
  const isUnauthenticated = authState === 'unauthenticated';
  const hasError = authState === 'error' && authError !== null;

  // Wrapped actions with error handling
  const signInSafely = useCallback(
    async (credentials: AuthCredentials): Promise<boolean> => {
      try {
        await signIn(credentials);
        return true;
      } catch (error) {
        return false;
      }
    },
    [signIn]
  );

  const signUpSafely = useCallback(
    async (registration: AuthRegistration): Promise<boolean> => {
      try {
        await signUp(registration);
        return true;
      } catch (error) {
        return false;
      }
    },
    [signUp]
  );

  const signOutSafely = useCallback(async (): Promise<boolean> => {
    try {
      await signOut();
      return true;
    } catch (error) {
      return false;
    }
  }, [signOut]);

  const resetPasswordSafely = useCallback(
    async (request: PasswordResetRequest): Promise<boolean> => {
      try {
        await resetPassword(request);
        return true;
      } catch (error) {
        return false;
      }
    },
    [resetPassword]
  );

  const updatePasswordSafely = useCallback(
    async (request: PasswordUpdateRequest): Promise<boolean> => {
      try {
        await updatePassword(request);
        return true;
      } catch (error) {
        return false;
      }
    },
    [updatePassword]
  );

  const updateEmailSafely = useCallback(
    async (request: EmailUpdateRequest): Promise<boolean> => {
      try {
        await updateEmail(request);
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateEmail]
  );

  const refreshSessionSafely = useCallback(async (): Promise<boolean> => {
    try {
      await refreshSession();
      return true;
    } catch (error) {
      return false;
    }
  }, [refreshSession]);

  return {
    // Auth state
    user,
    session,
    authState,
    authError,

    // Derived state
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    hasError,

    // Actions that throw on error (for form handling)
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    refreshSession,
    clearAuthError,

    // Safe actions that return boolean (for UI feedback)
    signInSafely,
    signUpSafely,
    signOutSafely,
    resetPasswordSafely,
    updatePasswordSafely,
    updateEmailSafely,
    refreshSessionSafely,
  };
}

/**
 * Hook for checking if user is authenticated
 * Useful for conditional rendering
 */
export function useIsAuthenticated(): boolean {
  return useAppStore((state) => state.authState === 'authenticated');
}

/**
 * Hook for getting current user
 * Returns null if not authenticated
 */
export function useCurrentUser(): AuthUser | null {
  const isAuthenticated = useIsAuthenticated();
  const user = useAppStore((state) => state.user);
  return isAuthenticated ? user : null;
}

/**
 * Hook for auth loading state
 * Useful for showing loading indicators
 */
export function useAuthLoading(): boolean {
  return useAppStore((state) => state.authState === 'loading');
}

/**
 * Hook for auth error state
 * Useful for error handling
 */
export function useAuthError(): AuthError | null {
  const hasError = useAppStore((state) => state.authState === 'error');
  const error = useAppStore((state) => state.authError);
  return hasError ? error : null;
}

/**
 * Hook for user display name
 * Returns formatted name or email as fallback
 */
export function useUserDisplayName(): string {
  const user = useCurrentUser();

  if (!user) return '';

  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  return user.email;
}

/**
 * Hook to check if user has verified email
 */
export function useEmailVerified(): boolean {
  const user = useCurrentUser();
  return user?.emailVerified ?? false;
}