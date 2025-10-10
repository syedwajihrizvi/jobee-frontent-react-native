import BackBar from "@/components/BackBar";
import CompanyInformation from "@/components/CompanyInformation";
import { useProfileInterviews } from "@/lib/services/useProfile";
import { convertTo12Hour, getInterviewStyle } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
            <View key={item.id} className="w-full px-4 py-2 rounded-full">
              <TouchableOpacity activeOpacity={0.2} onPress={() => router.push(`/profile/interviews/${item.id}`)}>
                <View className="flex-row items-center justify-between">
                  <CompanyInformation company={item.companyName} />
                </View>
                <View>
                  <View className="flex flex-row items-center justify-between">
                    <Text className="font-quicksand-bold text-xl">{item.jobTitle}</Text>
                    <Text className="font-quicksand-semibold text-sm">{item.interviewDate}</Text>
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-lg">{item.title}</Text>
                    <Text className="font-quicksand-medium text-md">{item.description}</Text>
                  </View>
                </View>
                <View className="flex flex-row gap-2 mt-2">
                  <Text className="font-quicksand-semibold text-sm text-green-800 bg-green-200 px-2 py-1 rounded-full">
                    {convertTo12Hour(item.startTime)} - {convertTo12Hour(item.endTime)}
                  </Text>
                  <Text className="font-quicksand-semibold text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                    {item.timezone}
                  </Text>
                  <Text className="font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full">
                    {getInterviewStyle(item.interviewType)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default UpcomingInterviews;
