import useAuthStore from "@/store/auth.store";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
export default function Index() {
  const { isLoading, fetchAuthenticatedUser, userType } = useAuthStore();
  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return userType === "user" ? (
    <Redirect href="./(tabs)/users/jobs" />
  ) : (
    // <View className="flex-1 justify-center items-center bg-red-500">
    //   <Text className="text-white text-xl">Tailwind Test</Text>
    //   <View className="apply-button p-4 m-4">
    //     <Text className="text-white">Custom Class Test</Text>
    //   </View>
    // </View>
    <Redirect href="./(tabs)/business/jobs" />
  );
}
