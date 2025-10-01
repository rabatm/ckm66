import { useCallback } from 'react'
import { AuthService } from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'
import type { LoginCredentials } from '../types/auth.types'

export const useAuth = () => {
  // Use selectors to get stable references
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const error = useAuthStore((state) => state.error)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setError = useAuthStore((state) => state.setError)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  // Fin initialisation
  // Vérifier l'état d'authentification
  const checkAuthState = async () => {
    try {
      const session = await AuthService.getCurrentSession()
      return !!session?.user
    } catch {
      return false
    }
  }
  // Actions
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.signIn(credentials)
      // L'utilisateur sera mis à jour via onAuthStateChange
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await AuthService.signOut()
      // Le clearAuth sera appelé via onAuthStateChange
    } catch (error: any) {
      setError(error.message || 'Erreur de déconnexion')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.resetPassword(email)
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la réinitialisation')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    // État
    user,
    isLoading,
    isAuthenticated,
    error,

    // Méthodes
    checkAuthState,

    // Actions
    signIn,
    signOut,
    resetPassword,

    // Utils
    clearError: () => setError(null),
  }
}
