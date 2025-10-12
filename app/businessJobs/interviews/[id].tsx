import BackBar from "@/components/BackBar";
import InterviewCard from "@/components/InterviewCard";
import { useInterviewsForJob } from "@/lib/services/useJobs";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Interviews = () => {
  const { id } = useLocalSearchParams();
  const { data: interviews, isLoading } = useInterviewsForJob(Number(id));
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interviews" />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          className="p-2"
          data={interviews}
          renderItem={({ item }) => (
            <InterviewCard
              interview={item}
              handlePress={() => router.push(`/businessJobs/interviews/interview/${item.id}`)}
            />
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-6">
              <View
                className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="calendar" size={32} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Interviews Yet</Text>
              <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
                When you schedule interviews for this job, they will appear here.
              </Text>
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
                    <Text className="font-quicksand-bold text-xl text-gray-900">Interviews for Job</Text>
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      View your upcoming and past interviews here for this position.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="font-quicksand-bold text-2xl text-blue-600">{interviews?.length}</Text>
                    <Text className="font-quicksand-medium text-sm text-blue-700">
                      Total Interview{`${interviews?.length > 1 ? "s" : ""}`}
                    </Text>
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

export default Interviews;
