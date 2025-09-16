import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { useJobsByUserFavorites } from "@/lib/services/useJobs";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FavoriteJobs = () => {
  const { data: jobs, isLoading } = useJobsByUserFavorites();

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="My Favorite Jobs" />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          className="flex-1 justify-center items-center"
        />
      ) : (
        <FlatList
          className="w-full p-2"
          data={jobs || []} // Simulating multiple job listings
          renderItem={({ item, index }: { item: Job; index: number }) => (
            <TouchableOpacity
              activeOpacity={0.2}
              onPress={() => router.push(`/jobs/${item.id}`)}
            >
              <JobListing showFavorite={false} key={index} job={item} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View className="divider" />}
          ListEmptyComponent={() => {
            return (
              <View className="p-4 flex-1 justify-center items-center">
                <Feather name="briefcase" size={64} color="black" />
                <Text className="font-quicksand-bold text-xl text-gray-600 mt-4">
                  No Favorite Jobs Yet
                </Text>
                <Text className="font-quicksand-regular text-gray-500 text-center mt-2 text-lg">
                  Browse some jobs and tap the star icon to add them to your
                  favorites.
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
