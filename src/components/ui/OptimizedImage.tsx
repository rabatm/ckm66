// src/components/ui/OptimizedImage.tsx
import React from 'react';
import { Image, ImageProps } from 'expo-image';
// import { ImageService } from '@/services/imageService';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  priority?: 'low' | 'normal' | 'high';
}

export function OptimizedImage({
  uri,
  width = 300,
  height = 300,
  priority = 'normal',
  style,
  recyclingKey,
  cachePolicy,
  ...props
}: OptimizedImageProps) {
  const optimizedUri = uri; // ImageService.optimizeUrl(uri, width, height);

  return (
    <Image
      source={{ uri: optimizedUri }}
      style={[{ width, height }, style]}
      priority={priority}
      cachePolicy={cachePolicy || 'memory-disk'}
      recyclingKey={recyclingKey || null}
      placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSo4A/08AXUFPZ7sFGjFYr5aaUPl7Eswm6v0eVRJWLyTVbJB7Wr1qbWBFCe9jAShfUW3F5GXFEa7L3nf3x9+G5L9p5f3o3wHpj7IYnvAp5lz8fUZGa8T5ynpJVlb/9k="
      transition={200}
      {...props}
    />
  );
}