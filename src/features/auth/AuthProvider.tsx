import React, { createContext, useContext, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { AuthService } from './services/auth.service'
import { useAuthStore } from './store/useAuthStore'

const AuthContext = createContext<null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialized = useRef(false)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setError = useAuthStore((state) => state.setError)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) {
      console.log('Auth already initialized, skipping...')
      return
    }

    console.log('Initializing auth for the first time...')
    initialized.current = true

    let mounted = true
    let subscription: any = null

    const initializeAuth = async () => {
      try {
        setLoading(true)

        // Get current session
        const session = await AuthService.getCurrentSession()

        if (mounted) {
          if (session?.user) {
            console.log('Found existing session for user:', session.user.id)
            const profile = await AuthService.getUserProfile(session.user.id)

            if (profile) {
              console.log('Profile found, setting user')
              setUser(profile)
            } else {
              console.log('No profile found, creating basic user from auth data')
              // Create a basic user object from Supabase auth user
              const basicUser = {
                id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.first_name || 'Utilisateur',
                last_name: session.user.user_metadata?.last_name || '',
                phone: session.user.user_metadata?.phone || null,
                role: 'member',
                is_active: true,
                created_at: session.user.created_at,
                updated_at: new Date().toISOString()
              }
              setUser(basicUser as any)
            }
          } else {
            console.log('No existing session found')
            clearAuth()
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error)
        if (mounted) clearAuth()
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Set up auth state listener
    const setupAuthListener = () => {
      console.log('Setting up auth state listener...')
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, !!session?.user)

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id)

          if (profile) {
            console.log('Profile found during sign in, setting user')
            setUser(profile)
          } else {
            console.log('No profile found during sign in, creating basic user from auth data')
            // Create a basic user object from Supabase auth user
            const basicUser = {
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || 'Utilisateur',
              last_name: session.user.user_metadata?.last_name || '',
              phone: session.user.user_metadata?.phone || null,
              role: 'member',
              is_active: true,
              created_at: session.user.created_at,
              updated_at: new Date().toISOString()
            }
            setUser(basicUser as any)
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
        }
      })
      subscription = data.subscription
    }

    // Initialize auth and set up listener
    initializeAuth()
    setupAuthListener()

    return () => {
      console.log('Cleaning up auth...')
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>
}