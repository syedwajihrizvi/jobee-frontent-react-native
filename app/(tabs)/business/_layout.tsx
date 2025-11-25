import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import useNotificationStore from "@/store/notifications.store";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const TabsLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { unreadMessages } = useConversationStore();
  const { unReadCount } = useNotificationStore();
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
        },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="dashboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs/index"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          tabBarButton: isAuthenticated ? undefined : () => null,
          tabBarIcon: ({ color, size }) => (
            <View className="relative">
              <Feather name="message-circle" size={size} color={color} />
              {unreadMessages > 0 && (
                <View
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center"
                  style={{
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <Text
                    className="text-white font-quicksand-bold text-xs"
                    style={{ fontSize: unreadMessages > 99 ? 9 : 10 }}
                  >
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          tabBarButton: isAuthenticated ? undefined : () => null,
          tabBarIcon: ({ color, size }) => (
            <View className="relative">
              <Feather name="bell" size={size} color={color} />
              {unReadCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center"
                  style={{
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <Text
                    className="text-white font-quicksand-bold text-xs"
                    style={{ fontSize: unReadCount > 99 ? 9 : 10 }}
                  >
                    {unReadCount > 99 ? "99+" : unReadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
