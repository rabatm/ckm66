import type { Profile } from '@/@types/global.types'

// L'utilisateur auth utilise directement le type Profile de ta DB
export type AuthUser = Profile

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface ResetPasswordData {
  email: string
}