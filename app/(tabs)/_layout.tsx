import { signOut } from '@/lib/auth';
import useAuthStore from '@/store/auth.store';
import { Redirect, router } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const TabsLayout = () => {
  const {isAuthenticated, removeUser} = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  const handleLogout = async () => {
    console.log("Logging out...");
    await signOut();
    await removeUser();
    router.push("/(auth)/sign-in");
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Button title='Logout' onPress={handleLogout}/>
    </View>
  );
}

export default TabsLayout