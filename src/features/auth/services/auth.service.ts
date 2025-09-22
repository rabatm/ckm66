import { supabase } from '../../../lib/supabase'
import type { LoginCredentials, RegisterCredentials, AuthUser } from '../types/auth.types'

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

  // Inscription
  static async signUp({ email, password, firstName, lastName, phone }: RegisterCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        },
      },
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
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // Récupérer le profil utilisateur depuis ta table profiles
  static async getUserProfile(userId: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
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
      redirectTo: 'com.kravmaga://reset-password',
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