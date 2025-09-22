// src/store/__tests__/useAppStore.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '../useAppStore';

// Mock MMKV
const mockMMKV = {
  set: jest.fn(),
  getString: jest.fn(),
  delete: jest.fn(),
  clearAll: jest.fn(),
};

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => mockMMKV),
}));

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store avant chaque test
    useAppStore.setState({
      user: null,
      theme: 'system',
      isLoading: false,
      notifications: true
    });
    jest.clearAllMocks();
  });

  test('should update user state', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    expect(result.current.user?.id).toBe('1');
    expect(result.current.user?.email).toBe('test@example.com');
  });

  test('should update theme', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  test('should handle loading state', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  test('should clear user on logout', () => {
    const { result } = renderHook(() => useAppStore());

    // Set a user first
    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(mockMMKV.clearAll).toHaveBeenCalled();
  });
});