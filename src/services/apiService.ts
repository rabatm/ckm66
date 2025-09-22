// src/services/apiService.ts
import { MMKV } from 'react-native-mmkv';

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Storage sécurisé pour les tokens
const secureStorage = new MMKV({ 
  id: 'secure-storage',
  encryptionKey: 'your-secure-key-here'
});

class ApiService {
  private baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com';
  private requestQueue: Map<string, Promise<any>> = new Map();

  // Déduplication des requêtes identiques
  private async deduplicatedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    const promise = requestFn();
    this.requestQueue.set(key, promise);

    try {
      const result = await promise;
      this.requestQueue.delete(key);
      return result;
    } catch (error) {
      this.requestQueue.delete(key);
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = secureStorage.getString('auth-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestKey = `${options.method || 'GET'}:${url}`;

    return this.deduplicatedRequest(requestKey, async () => {
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      };

      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            // Response n'est pas JSON
          }

          throw {
            message: errorData.message || `Erreur HTTP ${response.status}`,
            status: response.status,
            code: errorData.code,
          } as ApiError;
        }

        return await response.json();
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          throw error;
        }
        
        throw {
          message: 'Erreur de connexion',
          status: 0,
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
    });
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const requestOptions: RequestInit = {
      method: 'POST',
    };

    if (data !== undefined) {
      requestOptions.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  // Sauvegarder token de manière sécurisée
  setAuthToken(token: string): void {
    secureStorage.set('auth-token', token);
  }

  // Supprimer token
  removeAuthToken(): void {
    secureStorage.delete('auth-token');
  }
}

export const apiService = new ApiService();