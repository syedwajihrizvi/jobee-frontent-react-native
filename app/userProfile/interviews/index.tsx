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
  const completedInterviews = interviews?.filter((interview) => interview.status === "COMPLETED");
  return (
    <SafeAreaView>
      <BackBar label="Interviews" />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          className="p-2"
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
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                    <Feather name="calendar" size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-xl text-gray-900">Your Interviews</Text>
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      View your upcoming interviews and interview history.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="font-quicksand-bold text-2xl text-blue-600">{interviews?.length}</Text>
                    <Text className="font-quicksand-medium text-sm text-blue-700">Total Interviews</Text>
                  </View>
                  <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
                    <Text className="font-quicksand-bold text-2xl text-green-600">{completedInterviews?.length}</Text>
                    <Text className="font-quicksand-medium text-sm text-green-700">
                      Completed Interview{`${completedInterviews?.length > 1 ? "s" : ""}`}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={() => {
            return (
              <View className="flex-1 items-center justify-center px-6 py-20">
                <View
                  className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Feather name="calendar" size={32} color="#9ca3af" />
                </View>

                <Text className="font-quicksand-bold text-xl text-gray-900 mb-3 text-center">
                  No Interviews Scheduled
                </Text>

                <Text className="font-quicksand-medium text-sm text-gray-600 text-center leading-6 mb-6">
                  You do not have any upcoming interviews at the moment.{"\n"}
                  Keep applying to jobs and check back here for updates!
                </Text>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="bg-indigo-500 px-6 py-3 rounded-xl flex-row items-center gap-2"
                    style={{
                      shadowColor: "#6366f1",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={() => router.push("/users/jobs")}
                    activeOpacity={0.8}
                  >
                    <Feather name="search" size={16} color="white" />
                    <Text className="font-quicksand-bold text-white text-sm">Browse Jobs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-100 border border-gray-200 px-6 py-3 rounded-xl flex-row items-center gap-2"
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                  >
                    <Feather name="arrow-left" size={16} color="#6b7280" />
                    <Text className="font-quicksand-bold text-gray-700 text-sm">Go Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default UpcomingInterviews;
