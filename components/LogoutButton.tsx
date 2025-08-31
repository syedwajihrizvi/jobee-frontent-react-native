import { signOut } from '@/lib/auth';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';
import React from 'react';
import { Button } from 'react-native';

const LogoutButton = () => {
  const { removeUser, userType, setUserType } = useAuthStore()
  const handleLogout = async () => {
    await signOut();
    await removeUser();
    if (userType === 'business') {
      setUserType('business')
    }
    router.push("/(auth)/sign-in");
  }

  return (
    <Button title='Logout' onPress={handleLogout} />
  )
}

export default LogoutButton