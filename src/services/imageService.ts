// src/services/imageService.ts
import { Image } from 'expo-image';

export const ImageService = {
  // Configuration globale d'optimisation
  defaultProps: {
    cachePolicy: 'memory-disk' as const,
    recyclingKey: undefined,
    priority: 'normal' as const,
  },

  // Fonction d'optimisation des URLs
  optimizeUrl: (url: string, width: number, height: number): string => {
    // Exemple avec un CDN (Cloudinary, ImageKit, etc.)
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
    }
    
    // Fallback pour autres CDN ou URLs
    return `${url}?w=${width}&h=${height}&q=80&fm=webp`;
  },

  // Préchargement des images critiques
  preloadImages: async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => Image.prefetch(url));
    await Promise.allSettled(promises);
  }
};