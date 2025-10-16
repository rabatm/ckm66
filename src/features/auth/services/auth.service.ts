import { supabase } from '../../../lib/supabase'
import type { LoginCredentials, AuthUser } from '../types/auth.types'

export class AuthService {
  // Connexion
  static async signIn({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  // Déconnexion
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Récupérer la session courante
  static async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // Récupérer le profil utilisateur depuis ta table profiles
  static async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error) {
        // Si le profil n'existe pas, ce n'est pas forcément une erreur
        if (error.code === 'PGRST116') {
          console.log('Profile not found for user:', userId)
          return null
        }
        // Permission denied or other errors
        if (error.code === '42501') {
          console.log('Permission denied accessing profiles table')
          return null
        }
        console.error('Error fetching user profile:', error)
        return null // Don't throw, return null instead
      }

      return data
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error)
      return null
    }
  }

  // Créer un profil utilisateur après inscription
  static async createUserProfile(
    userId: string,
    userData: {
      email: string
      firstName: string
      lastName: string
      phone?: string
    }
  ): Promise<AuthUser> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        role: 'member',
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }

    return data
  }

  // Mettre à jour le profil
  static async updateProfile(userId: string, updates: Partial<AuthUser>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'com.ckm66.myapp://reset-password',
    })

    if (error) throw error
  }

  // Update password (called when user submits new password)
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  // Vérifier si l'utilisateur est actif
  static async checkUserActiveStatus(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data?.is_active ?? false
  }
}
