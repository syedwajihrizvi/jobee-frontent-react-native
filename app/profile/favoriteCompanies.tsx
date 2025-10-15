import BackBar from "@/components/BackBar";
import FavoriteCompanyCard from "@/components/FavoriteCompanyCard";
import SearchBar from "@/components/SearchBar";
import useProfileSummaryStore from "@/store/profile-summary.store";
import React from "react";
import { StatusBar, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const FavoriteCompanies = () => {
  const { isLoading, profileSummary } = useProfileSummaryStore();
  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <StatusBar hidden={true} />
      <BackBar label="Favorite Companies" />
      <View className="w-full items-center justify-center my-4">
        <SearchBar placeholder="Search for Companies..." onSubmit={() => {}} />
      </View>
      <FlatList
        data={profileSummary?.favoriteCompanies || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <FavoriteCompanyCard
            company={item}
            onPress={() => {
              console.log("Navigate to company:", item.id);
            }}
            onFavoritePress={() => {
              console.log("Unfavorite company:", item.id);
            }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

export default FavoriteCompanies;
