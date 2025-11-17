import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import useUserJobsStore from "@/store/userJobsStore";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FavoriteJobs = () => {
  const {
    isLoadingFavoriteJobs,
    hasValidFavoriteJobsCache,
    fetchFavoriteJobsForUserAndFilter,
    refreshFavoriteJobs,
    getPaginationForFavoriteJobs,
    getTotalCountForFavoriteJobs,
    getFavoriteJobs,
  } = useUserJobsStore();

  const isLoading = isLoadingFavoriteJobs();
  const jobs = getFavoriteJobs();
  const pagination = getPaginationForFavoriteJobs();
  const totalCount = getTotalCountForFavoriteJobs();
  useEffect(() => {
    const cacheValid = hasValidFavoriteJobsCache();
    if (!cacheValid) {
      refreshFavoriteJobs();
    }
  }, []);

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="My Favorite Jobs" />
      <FlatList
        className="w-full px-4"
        showsVerticalScrollIndicator={false}
        data={jobs || []}
        renderItem={({ item, index }: { item: Job; index: number }) => (
          <TouchableOpacity className="p-1" activeOpacity={0.2} onPress={() => router.push(`/jobs/${item.id}`)}>
            <JobListing key={index} job={item} />
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (pagination?.hasMore) {
            const nextPage = pagination?.currentPage + 1;
            fetchFavoriteJobsForUserAndFilter(nextPage);
          }
        }}
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
                  <Text className="font-quicksand-bold text-xl text-gray-900">{totalCount} Favorite Jobs</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    View jobs you have favorited for easy access later.
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

export default FavoriteJobs;
