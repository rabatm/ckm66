import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthScreen } from '@/features/auth/screens/AuthScreen';
import { MainApp } from '@/features/main/screens/MainApp';

function AppContent() {
  console.log('AppContent rendered')
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isAuthenticated && user ? <MainApp /> : <AuthScreen />}
    </View>
  );
}

export default function App() {
  console.log('App component rendered')
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}