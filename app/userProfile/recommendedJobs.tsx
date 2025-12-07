import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { formatSWord } from "@/lib/utils";
import useUserJobsStore from "@/store/userJobsStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RecommendedJobs = () => {
  const {
    refreshRecommendedJobs,
    getRecommendations: getRecommendedJobs,
    isLoadingRecommendedJobs,
    hasValidRecommendedJobsCache,
  } = useUserJobsStore();

  const jobs = getRecommendedJobs();
  const isLoading = isLoadingRecommendedJobs();
  const totalCount = jobs?.length || 0;

  useEffect(() => {
    const cacheValid = hasValidRecommendedJobsCache();
    if (!cacheValid) {
      refreshRecommendedJobs();
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar label="Recommended Jobs" />
      <FlatList
        className="w-full p-2"
        showsVerticalScrollIndicator={false}
        data={jobs || []}
        renderItem={({ item, index }) => (
          <TouchableOpacity className="p-1" activeOpacity={0.2} onPress={() => router.push(`/jobs/${item.job.id}`)}>
            <JobListing key={index} job={item.job} matchScore={item.match} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View className="divider" />}
        ListHeaderComponent={() =>
          totalCount > 0 ? (
            <View
              className="mx-2 mb-2 bg-white rounded-2xl px-3 py-2 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-3 mb-2">
                <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="folder" size={24} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-xl text-gray-900">
                    {totalCount} Recommended {formatSWord("Job", totalCount)}
                  </Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    View jobs you might be interested in.
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
        ListFooterComponent={() => {
          return isLoading ? <ActivityIndicator size="small" color="green" className="my-4" /> : null;
        }}
        ListEmptyComponent={() => {
          return (
            <View className="p-4 flex-1 justify-center items-center">
              <Feather name="briefcase" size={64} color="black" />
              <Text className="font-quicksand-bold text-xl text-gray-600 mt-4">No Favorite Jobs Yet</Text>
              <Text className="font-quicksand-regular text-gray-500 text-center mt-2 text-lg">
                Browse some jobs and tap the star icon to add them to your favorites.
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default RecommendedJobs;
