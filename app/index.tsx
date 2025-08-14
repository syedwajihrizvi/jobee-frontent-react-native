import useAuthStore from '@/store/auth.store';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading, fetchAuthenticatedUser } = useAuthStore();
  
  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Temporary bypass for authentication
  if (1 === 1) {
    console.log('Bypassing authentication check');
    return <Redirect href="/(tabs)/jobs" />;
  } else {
    console.log('Redirecting to sign-in');
    return <Redirect href="/(auth)/sign-in" />;
  }
}
