import BackBar from "@/components/BackBar";
import FavoriteCompanyCard from "@/components/FavoriteCompanyCard";
import SearchBar from "@/components/SearchBar";
import { useCompanies } from "@/lib/services/useCompanies";
import { toggleFavoriteCompany } from "@/lib/updateUserProfile";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { Company } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const FavoriteCompanies = () => {
  const { isLoading, profileSummary } = useProfileSummaryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies(searchQuery);

  const checkIfCompanyIsFavorited = (companyId: number) => {
    if (!profileSummary) return false;
    return profileSummary?.favoriteCompanies.some((company) => company.id === companyId);
  };

  const handleFavoriteCompany = async (company: Company) => {
    try {
      const result = await toggleFavoriteCompany(Number(company.id));
      if (result) {
        const currFavorites = profileSummary?.favoriteCompanies || [];
        const index = currFavorites.findIndex((c) => c.id === Number(company.id));
        if (index > -1) {
          const newFavorites = currFavorites.filter((c) => c.id !== Number(company.id));
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: newFavorites,
          });
        } else {
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: [company, ...currFavorites],
          });
        }
        console.log("Successfully toggled favorite company");
      }
    } catch (error) {
      console.error("Error toggling favorite company:", error);
    }
  };

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <StatusBar hidden={true} />
      <BackBar label="Favorite Companies" />
      <View className="w-full items-center justify-center my-4">
        <SearchBar placeholder="Search for Companies..." onSubmit={(text) => setSearchQuery(text)} />
      </View>
      {!isLoadingCompanies && searchQuery.length > 0 && (
        <FlatList
          data={companies || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <FavoriteCompanyCard
              isFavorited={checkIfCompanyIsFavorited(item.id)}
              company={item}
              onPress={() => {
                router.push(`/users/jobs?companyName=${item.name}`);
              }}
              onFavoritePress={() => {
                handleFavoriteCompany(item);
              }}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center px-6 py-12">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
                <Feather name="search" size={32} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900 text-center mb-3">No Companies Found</Text>
              <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6 mb-6">
                We could not find any companies matching &quot;{searchQuery}&quot;. Try adjusting your search terms.
              </Text>
              <TouchableOpacity
                className="bg-blue-500 rounded-xl px-6 py-3 flex-row items-center gap-2"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => setSearchQuery("")}
                activeOpacity={0.8}
              >
                <Feather name="refresh-cw" size={16} color="white" />
                <Text className="font-quicksand-bold text-white text-base">Clear Search</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {!isLoading && searchQuery.length === 0 && (
        <FlatList
          data={profileSummary?.favoriteCompanies || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <FavoriteCompanyCard
              isFavorited={checkIfCompanyIsFavorited(item.id)}
              company={item}
              onPress={() => {
                router.push(`/users/jobs?companyName=${item.name}`);
              }}
              onFavoritePress={() => {
                handleFavoriteCompany(item);
              }}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center px-6 py-12">
              <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
                <Feather name="heart" size={32} color="#ef4444" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900 text-center mb-3">No Favorite Companies</Text>
              <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6 mb-6">
                You have not favorited any companies yet. Start exploring and save companies you are interested in!
              </Text>
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl px-6 py-3 flex-row items-center gap-2"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => router.push("/users/jobs")}
                activeOpacity={0.8}
              >
                <Feather name="search" size={16} color="white" />
                <Text className="font-quicksand-bold text-white text-base">Explore Companies</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default FavoriteCompanies;
