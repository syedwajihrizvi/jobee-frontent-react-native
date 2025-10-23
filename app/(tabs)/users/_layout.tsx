import useAuthStore from "@/store/auth.store";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const TabsLayout = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarStyle: {
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          borderBottomLeftRadius: 40,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderTopWidth: 0,
          borderBottomWidth: 0,
          borderBottomRightRadius: 40,
          marginHorizontal: 20,
          height: 80,
          position: "absolute",
          bottom: 20,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          paddingHorizontal: 20,
          paddingVertical: 10,
          opacity: isAuthenticated ? 1 : 0,
          zIndex: isAuthenticated ? 1 : -1,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          tabBarButton: isAuthenticated ? undefined : () => null,
          tabBarIcon: ({ color, size }) => <AntDesign name="dashboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs/index"
        options={{
          tabBarButton: isAuthenticated ? undefined : () => null,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          tabBarButton: isAuthenticated ? undefined : () => null,
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarButton: isAuthenticated ? undefined : () => null,
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
