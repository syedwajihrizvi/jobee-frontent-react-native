import BackBar from "@/components/BackBar";
import CompanyInformation from "@/components/CompanyInformation";
import { useProfileInterviews } from "@/lib/services/useProfile";
import { convertTo12Hour, getInterviewStyle } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: Use InterivewCard instead
const UpcomingInterviews = () => {
  const { userId } = useLocalSearchParams();
  const { data: interviews, isLoading } = useProfileInterviews(Number(userId));

  return (
    <SafeAreaView>
      <BackBar label="Upcoming Interviews" />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          className="p-2"
          data={interviews}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
              activeOpacity={0.7}
              onPress={() => router.push(`/userProfile/interviews/${item.id}`)}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <CompanyInformation company={item.companyName} />
                </View>
                <View
                  className="bg-indigo-100 px-3 py-1 rounded-full"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text className="font-quicksand-bold text-xs text-indigo-700">{item.interviewDate}</Text>
                </View>
              </View>
              <View className="mb-4">
                <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">{item.jobTitle}</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <Text className="font-quicksand-bold text-base text-gray-800 mb-1">{item.title}</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600 leading-5" numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-2 mb-3">
                <View
                  className="bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl flex-row items-center gap-1"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Feather name="clock" size={12} color="#059669" />
                  <Text className="font-quicksand-semibold text-xs text-emerald-800">
                    {convertTo12Hour(item.startTime)} - {convertTo12Hour(item.endTime)}
                  </Text>
                </View>
                <View
                  className="bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl flex-row items-center gap-1"
                  style={{
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Feather name="globe" size={12} color="#2563eb" />
                  <Text className="font-quicksand-semibold text-xs text-blue-800">{item.timezone}</Text>
                </View>
                <View
                  className="bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl flex-row items-center gap-1"
                  style={{
                    shadowColor: "#8b5cf6",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Feather
                    name={
                      item.interviewType === "ONLINE" ? "video" : item.interviewType === "PHONE" ? "phone" : "users"
                    }
                    size={12}
                    color="#7c3aed"
                  />
                  <Text className="font-quicksand-semibold text-xs text-purple-800">
                    {getInterviewStyle(item.interviewType)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 bg-emerald-500 rounded-full"></View>
                  <Text className="font-quicksand-medium text-sm text-gray-600">Interview scheduled</Text>
                </View>
                <View
                  className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Feather name="chevron-right" size={16} color="#6366f1" />
                </View>
              </View>
            </TouchableOpacity>
          )}
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
                    <Text className="font-quicksand-bold text-2xl text-green-600">{interviews?.length}</Text>
                    <Text className="font-quicksand-medium text-sm text-green-700">
                      Completed Interview{`${interviews?.length > 1 ? "s" : ""}`}
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
