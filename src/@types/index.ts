// src/types/index.ts

// Auth Types
export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthRegistration extends AuthCredentials {
  firstName?: string;
  lastName?: string;
}

export interface AuthError {
  message: string;
  code: string;
  status?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailUpdateRequest {
  newEmail: string;
  password: string;
}

// Legacy User interface (kept for backward compatibility)
export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: 'with-image' | 'text-only';
}

export type Theme = 'light' | 'dark' | 'system';

// Auth State Types
export type AuthState =
  | 'unauthenticated'
  | 'authenticated'
  | 'loading'
  | 'error';

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  authState: AuthState;
  error: AuthError | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (registration: AuthRegistration) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  updatePassword: (request: PasswordUpdateRequest) => Promise<void>;
  updateEmail: (request: EmailUpdateRequest) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}