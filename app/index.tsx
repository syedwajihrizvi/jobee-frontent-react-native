import useAuthStore from '@/store/auth.store';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLoading, fetchAuthenticatedUser, userType } = useAuthStore();
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
  console.log(userType)
  return userType === 'user' ? <Redirect href="/(tabs)/users/jobs" /> : <Redirect href="/(tabs)/business/jobs" />;
}
