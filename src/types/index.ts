// src/types/index.ts
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