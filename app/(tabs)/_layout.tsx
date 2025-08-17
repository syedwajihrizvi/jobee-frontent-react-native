// import useAuthStore from '@/store/auth.store';
import useAuthStore from '@/store/auth.store';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarShowLabel: false, 
      tabBarStyle: {borderTopLeftRadius: 40, 
      borderTopRightRadius: 40, borderBottomLeftRadius: 40,
      display: 'flex', 
      flexDirection: 'row', justifyContent: 'space-around', 
      alignItems: 'center', 
      borderTopWidth: 0, borderBottomWidth: 0,
      borderBottomRightRadius: 40,
      marginHorizontal: 20, height: 80, position: 'absolute', 
      bottom: 20, backgroundColor: '#fff', shadowColor: '#000', 
      shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, 
      shadowRadius: 3.84, elevation: 5, paddingHorizontal: 20, paddingVertical: 10
      }}}>
      <Tabs.Screen 
        name="jobs/index"
        options={{
          tabBarIcon: ({color, size}) => (
            <AntDesign name="home" size={size} color={color} />
          )
        }}/>
      <Tabs.Screen 
        name="messages/index"
        options={{
          tabBarIcon: ({color, size}) => (
            <AntDesign name="message1" size={size} color={color} />
          )
        }}/>
      <Tabs.Screen 
        name="calendar/index"
        options={{
          tabBarIcon: ({color, size}) => (
            <AntDesign name="calendar" size={size} color={color} />
          )
        }}/>
      <Tabs.Screen 
        name="profile/index"
        options={{
          tabBarIcon: ({color, size}) => (
            <AntDesign name="user" size={size} color={color} />
          )
        }}/>
    </Tabs>
  );
}

export default TabsLayout