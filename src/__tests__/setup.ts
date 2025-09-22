// src/__tests__/setup.ts
import { jest } from '@jest/globals';

// Mock des modules natifs
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock pour Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
}));

// Silence des warnings Jest
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: Act warnings')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};