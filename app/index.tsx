import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
export default function Index() {
  const { isLoading: isLoadingAuthUser, fetchAuthenticatedUser, userType, isAuthenticated } = useAuthStore();
  const { isLoading: isLoadingProfileSummary, fetchProfileSummary } = useProfileSummaryStore();
  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  useEffect(() => {
    if (isAuthenticated && userType === "user") {
      fetchProfileSummary();
    }
  }, [fetchProfileSummary, userType, isAuthenticated]);

  if (isLoadingAuthUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return userType === "user" ? <Redirect href="./(tabs)/users/jobs" /> : <Redirect href="./(tabs)/business/jobs" />;
}
