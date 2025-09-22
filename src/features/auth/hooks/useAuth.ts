import { useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { AuthService } from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'
import type { LoginCredentials, RegisterCredentials } from '../types/auth.types'

export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setLoading,
    setError,
    clearAuth,
  } = useAuthStore()

  // Initialisation - Écoute des changements d'auth
  useEffect(() => {
    let mounted = true

    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        setLoading(true)
        const session = await AuthService.getCurrentSession()
        
        if (session?.user && mounted) {
          const profile = await AuthService.getUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) setError('Erreur lors de la récupération de la session')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getInitialSession()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await AuthService.getUserProfile(session.user.id)
            if (profile) setUser(profile)
          } catch (error) {
            console.error('Error fetching user profile:', error)
            setError('Erreur lors de la récupération du profil')
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])
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

  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.signUp(credentials)
      // Gérer la confirmation email si nécessaire
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'inscription')
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
    signUp,
    signOut,
    resetPassword,
    
    // Utils
    clearError: () => setError(null),
  }
}