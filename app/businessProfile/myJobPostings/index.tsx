import BackBar from "@/components/BackBar";
import RenderBusinessJobs from "@/components/RenderBusinessJobs";
import useAuthStore from "@/store/auth.store";
import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyJobPostings = () => {
  const { user, isLoading } = useAuthStore();
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden={true} />
      <BackBar label="My Job Postings" />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <RenderBusinessJobs postedByAccountId={user?.id} showHeader={false} />
      )}
    </SafeAreaView>
  );
};

export default MyJobPostings;
