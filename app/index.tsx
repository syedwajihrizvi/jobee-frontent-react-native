import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
export default function Index() {
  const { isLoading: isLoadingAuthUser, fetchAuthenticatedUser, userType, isAuthenticated } = useAuthStore();
  const { isLoading: isLoadingProfileSummary, fetchProfileSummary } = useProfileSummaryStore();
  const { isLoading: isLoadingBusinessSummary, fetchProfileSummary: fetchBusinessProfileSummary } =
    useBusinessProfileSummaryStore();
  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  useEffect(() => {
    if (isAuthenticated && userType === "user") {
      fetchProfileSummary();
    } else if (isAuthenticated && userType === "business") {
      fetchBusinessProfileSummary();
    }
  }, [fetchProfileSummary, fetchBusinessProfileSummary, userType, isAuthenticated]);

  if (isLoadingAuthUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return userType === "user" ? <Redirect href="./(tabs)/users/jobs" /> : <Redirect href="./(tabs)/business/jobs" />;
}
