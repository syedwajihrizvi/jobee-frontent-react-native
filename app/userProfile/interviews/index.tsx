import BackBar from "@/components/BackBar";
import UserInterviewCard from "@/components/UserInterviewCard";
import useUserStore from "@/store/user.store";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UpcomingInterviews = () => {
  const { interviews, isLoadingInterviews: isLoading } = useUserStore();
  return (
    <SafeAreaView>
      <BackBar label="Your Interviews" />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          className="p-2 pb-10"
          data={interviews}
          renderItem={({ item }) => <UserInterviewCard item={item} />}
          ListHeaderComponent={() =>
            interviews && interviews.length > 0 ? (
              <View
                className="mx-4 mb-6 bg-white rounded-2xl p-5 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                    <Feather name="calendar" size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-xl text-gray-900">Your Interviews</Text>
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      View your upcoming interviews and interview history.
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center px-6 py-20">
              <View
                className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-6"
                style={{
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="calendar" size={32} color="#6366f1" />
              </View>

              <Text className="font-quicksand-bold text-xl text-gray-900 mb-3 text-center">
                No Interviews Scheduled
              </Text>

              <Text className="font-quicksand-medium text-gray-600 text-center leading-6 mb-8">
                You do not have any interviews yet. Keep applying to jobs and you will start receiving interview
                invitations!
              </Text>

              <TouchableOpacity
                className="bg-emerald-500 px-6 py-3 rounded-xl flex-row items-center gap-2 mb-4"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => router.push("/(tabs)/users/jobs")}
                activeOpacity={0.8}
              >
                <Feather name="search" size={16} color="white" />
                <Text className="font-quicksand-bold text-white">Find Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-indigo-100 px-4 py-2 rounded-lg flex-row items-center gap-2"
                onPress={() => router.push("/userProfile/appliedJobs")}
                activeOpacity={0.8}
              >
                <Feather name="briefcase" size={14} color="#6366f1" />
                <Text className="font-quicksand-semibold text-indigo-600 text-sm">View Applied Jobs</Text>
              </TouchableOpacity>

              <View className="mt-6 flex-row items-center gap-3">
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
                <Text className="font-quicksand-medium text-xs text-gray-500">
                  Interviews will appear here once scheduled
                </Text>
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default UpcomingInterviews;
