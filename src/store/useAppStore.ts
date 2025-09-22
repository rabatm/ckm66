// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
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
  User,
  Theme
} from '@/@types';
import { authService } from '@/services/authService';

// Instance MMKV avec chiffrement pour données sensibles
const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'your-encryption-key-here' // En production, utiliser une clé générée
});

interface AppState {
  // État d'authentification
  user: AuthUser | null;
  session: AuthSession | null;
  authState: AuthState;
  authError: AuthError | null;

  // État application
  theme: Theme;
  isLoading: boolean;
  notifications: boolean;

  // Actions d'authentification
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (registration: AuthRegistration) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  updatePassword: (request: PasswordUpdateRequest) => Promise<void>;
  updateEmail: (request: EmailUpdateRequest) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearAuthError: () => void;

  // Actions application
  setTheme: (theme: Theme) => void;
  setIsLoading: (loading: boolean) => void;
  setNotifications: (enabled: boolean) => void;

  // Actions système
  initializeApp: () => Promise<void>;

  // Actions internes
  _setAuthState: (state: AuthState) => void;
  _setUser: (user: AuthUser | null) => void;
  _setSession: (session: AuthSession | null) => void;
  _setAuthError: (error: AuthError | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial d'authentification
      user: null,
      session: null,
      authState: 'loading',
      authError: null,

      // État initial application
      theme: 'system',
      isLoading: false,
      notifications: true,

      // Actions internes
      _setAuthState: (authState) => set({ authState }),
      _setUser: (user) => set({ user }),
      _setSession: (session) => set({ session }),
      _setAuthError: (authError) => set({ authError }),

      // Actions d'authentification
      signIn: async (credentials) => {
        set({ authState: 'loading', authError: null });
        try {
          const session = await authService.signInWithEmailAndPassword(credentials);
          set({
            session,
            user: session.user,
            authState: 'authenticated',
            authError: null,
          });
        } catch (error) {
          set({
            authState: 'error',
            authError: error as AuthError,
            user: null,
            session: null,
          });
          throw error;
        }
      },

      signUp: async (registration) => {
        set({ authState: 'loading', authError: null });
        try {
          const session = await authService.signUpWithEmailAndPassword(registration);
          if (session) {
            set({
              session,
              user: session.user,
              authState: 'authenticated',
              authError: null,
            });
          } else {
            // Email confirmation required
            set({
              authState: 'unauthenticated',
              authError: null,
              user: null,
              session: null,
            });
          }
        } catch (error) {
          set({
            authState: 'error',
            authError: error as AuthError,
            user: null,
            session: null,
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ authState: 'loading', authError: null });
        try {
          await authService.signOut();
          set({
            user: null,
            session: null,
            authState: 'unauthenticated',
            authError: null,
          });
          // Clear sensitive data
          storage.clearAll();
        } catch (error) {
          set({
            authState: 'error',
            authError: error as AuthError,
          });
          throw error;
        }
      },

      resetPassword: async (request) => {
        set({ authError: null });
        try {
          await authService.requestPasswordReset(request);
        } catch (error) {
          set({ authError: error as AuthError });
          throw error;
        }
      },

      updatePassword: async (request) => {
        set({ authError: null });
        try {
          await authService.updatePassword(request);
        } catch (error) {
          set({ authError: error as AuthError });
          throw error;
        }
      },

      updateEmail: async (request) => {
        set({ authError: null });
        try {
          await authService.updateEmail(request);
        } catch (error) {
          set({ authError: error as AuthError });
          throw error;
        }
      },

      refreshSession: async () => {
        try {
          const session = await authService.refreshSession();
          if (session) {
            set({
              session,
              user: session.user,
              authState: 'authenticated',
              authError: null,
            });
          } else {
            set({
              user: null,
              session: null,
              authState: 'unauthenticated',
              authError: null,
            });
          }
        } catch (error) {
          set({
            authState: 'error',
            authError: error as AuthError,
            user: null,
            session: null,
          });
          throw error;
        }
      },

      clearAuthError: () => set({ authError: null }),

      // Actions application
      setTheme: (theme) => set({ theme }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setNotifications: (notifications) => set({ notifications }),

      // Initialisation de l'application
      initializeApp: async () => {
        set({ authState: 'loading' });
        try {
          // Vérifier la session existante
          const session = await authService.getCurrentSession();

          if (session) {
            set({
              session,
              user: session.user,
              authState: 'authenticated',
              authError: null,
            });

            // Configurer l'écoute des changements d'état d'auth
            authService.onAuthStateChange((session) => {
              if (session) {
                set({
                  session,
                  user: session.user,
                  authState: 'authenticated',
                  authError: null,
                });
              } else {
                set({
                  user: null,
                  session: null,
                  authState: 'unauthenticated',
                  authError: null,
                });
              }
            });
          } else {
            set({
              user: null,
              session: null,
              authState: 'unauthenticated',
              authError: null,
            });
          }
        } catch (error) {
          console.error('Erreur initialisation app:', error);
          set({
            authState: 'error',
            authError: error as AuthError,
            user: null,
            session: null,
          });
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => ({
        setItem: (name, value) => storage.set(name, value),
        getItem: (name) => storage.getString(name) ?? null,
        removeItem: (name) => storage.delete(name),
      })),
      // Partialiser pour ne persister que certaines données
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
        // Note: Ne pas persister les données d'auth ici car Supabase gère la persistence
      }),
    }
  )
);