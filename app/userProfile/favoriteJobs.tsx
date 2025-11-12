import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { useJobsByUserFavorites } from "@/lib/services/useJobs";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FavoriteJobs = () => {
  const { data: jobs, isLoading } = useJobsByUserFavorites();

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="My Favorite Jobs" />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full p-2"
          showsVerticalScrollIndicator={false}
          data={jobs || []}
          renderItem={({ item, index }: { item: Job; index: number }) => (
            <TouchableOpacity className="p-1" activeOpacity={0.2} onPress={() => router.push(`/jobs/${item.id}`)}>
              <JobListing
                showFavorite={false}
                showStatus={true}
                key={index}
                job={item}
                showQuickApply={false}
                showViewDetails={false}
              />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View className="divider" />}
          ListHeaderComponent={() =>
            jobs && jobs.length > 0 ? (
              <View
                className="mx-2 mb-6 bg-white rounded-2xl p-5 border border-gray-100"
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
                    <Feather name="folder" size={24} color="#6366f1" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-xl text-gray-900">Favorite Jobs</Text>
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      View jobs you have favorited for easy access later.
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="font-quicksand-bold text-2xl text-blue-600">{jobs?.length}</Text>
                    <Text className="font-quicksand-medium text-sm text-blue-700">Jobs Favorited</Text>
                  </View>
                </View>
              </View>
            ) : null
          }
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
      )}
    </SafeAreaView>
  );
};

export default FavoriteJobs;
