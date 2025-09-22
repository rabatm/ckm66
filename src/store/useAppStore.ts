// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { User } from '@/types';

// Instance MMKV avec chiffrement pour données sensibles
const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'your-encryption-key-here' // En production, utiliser une clé générée
});

interface AppState {
  // État
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  notifications: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setIsLoading: (loading: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  logout: () => void;
  
  // Actions async
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      theme: 'system',
      isLoading: false,
      notifications: true,
      
      // Actions synchrones
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setNotifications: (notifications) => set({ notifications }),
      
      logout: () => {
        set({ user: null });
        storage.clearAll();
      },
      
      // Actions asynchrones
      initializeApp: async () => {
        set({ isLoading: true });
        try {
          // Logique d'initialisation
          const userData = storage.getString('user-data');
          if (userData) {
            const user = JSON.parse(userData);
            set({ user });
          }
        } catch (error) {
          console.error('Erreur initialisation app:', error);
        } finally {
          set({ isLoading: false });
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
        user: state.user,
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
);