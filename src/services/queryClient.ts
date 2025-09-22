// src/services/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';

// Storage pour cache persistant des queries
const queryStorage = new MMKV({ id: 'react-query-cache' });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes par défaut
      staleTime: 1000 * 60 * 5,
      // Garder en mémoire pendant 30 minutes
      gcTime: 1000 * 60 * 30,
      // Retry intelligent
      retry: (failureCount, error: any) => {
        // Pas de retry sur les erreurs client (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Maximum 2 retries pour les autres erreurs
        return failureCount < 2;
      },
      // Optimisations réseau
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: false, // Pas de retry automatique pour les mutations
    },
  },
});

// Fonctions pour persistence du cache (optionnel)
export const persistQueryCache = {
  save: (key: string, data: any) => {
    queryStorage.set(key, JSON.stringify(data));
  },
  load: (key: string) => {
    const data = queryStorage.getString(key);
    return data ? JSON.parse(data) : undefined;
  },
  remove: (key: string) => {
    queryStorage.delete(key);
  },
};