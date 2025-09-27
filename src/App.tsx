import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { MainApp } from '@/features/main/screens/MainApp';


export default function App() {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    checkAuthState();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {user ? <MainApp /> : <LoginForm />}
    </View>
  );
}