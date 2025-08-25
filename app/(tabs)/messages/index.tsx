import useAuthStore from '@/store/auth.store';
import { Redirect } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const Messages = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
  return (
    <View>
      <Text>Messages</Text>
    </View>
  )
}

export default Messages