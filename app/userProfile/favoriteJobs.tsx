import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { formatSWord } from "@/lib/utils";
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
        className="w-full px-4 mt-8"
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
                  <Text className="font-quicksand-bold text-xl text-gray-900">
                    {totalCount} Favorite {formatSWord("Job", totalCount)}
                  </Text>
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
            <View className="flex-1 items-center justify-center px-6 py-20">
              <View
                className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-6"
                style={{
                  shadowColor: "#f59e0b",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="star" size={32} color="#f59e0b" />
              </View>

              <Text className="font-quicksand-bold text-xl text-gray-900 mb-3 text-center">No Favorite Jobs Yet</Text>

              <Text className="font-quicksand-medium text-gray-600 text-center leading-6 mb-8">
                Start building your collection! Browse jobs and tap the star icon to save positions you are interested
                in.
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
                <Text className="font-quicksand-bold text-white">Browse Jobs</Text>
              </TouchableOpacity>

              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-start gap-3">
                <View className="w-6 h-6 bg-amber-100 rounded-full items-center justify-center mt-0.5">
                  <Feather name="info" size={12} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-amber-800 text-sm mb-1">Pro Tip</Text>
                  <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
                    Save jobs to easily track opportunities you are considering and apply when you are ready!
                  </Text>
                </View>
              </View>

              <View className="mt-6 flex-row items-center gap-3">
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
                <Text className="font-quicksand-medium text-xs text-gray-500">Your saved jobs will appear here</Text>
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default FavoriteJobs;
