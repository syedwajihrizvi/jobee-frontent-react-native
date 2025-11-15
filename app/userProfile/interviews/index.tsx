import BackBar from "@/components/BackBar";
import NoInterviews from "@/components/NoInterviews";
import UserInterviewCard from "@/components/UserInterviewCard";
import useUserStore from "@/store/user.store";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
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
          ListEmptyComponent={() => <NoInterviews filter={null} />}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default UpcomingInterviews;
