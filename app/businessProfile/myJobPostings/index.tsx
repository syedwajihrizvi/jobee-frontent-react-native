import BackBar from "@/components/BackBar";
import BusinessJobListings from "@/components/BusinessJobListings";
import SearchBar from "@/components/SearchBar";
import { images } from "@/constants";
import { useUserJobPostings } from "@/lib/services/useUserJobPostings";
import useAuthStore from "@/store/auth.store";
import { BusinessUser } from "@/type";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Image, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyJobPostings = () => {
  const { user: authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const { isLoading, data: jobs } = useUserJobPostings((authUser as BusinessUser).id, search);
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden={true} />
      <BackBar label="My Job Postings" />
      <View className="w-full flex-row items-center justify-center px-2 gap-4 mt-2">
        <SearchBar placeholder="Search for Jobs..." onSubmit={(text) => setSearch(text)} />
      </View>
      <View
        className="mx-4 mb-3 mt-3 bg-white rounded-2xl p-5 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center gap-3 mb-4">
          <View className="items-center justify-center">
            <Image source={{ uri: images.companyLogo }} className="size-12 rounded-full" resizeMode="contain" />
          </View>
          <View>
            <Text className="font-quicksand-bold text-xl text-gray-900">Jobs</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">View Jobs that you have posted</Text>
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <Text className="font-quicksand-bold text-2xl text-blue-600">{jobs?.length}</Text>
            <Text className="font-quicksand-medium text-sm text-blue-700">Active Jobs</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
            <Text className="font-quicksand-bold text-2xl text-green-600">{jobs?.length}</Text>
            <Text className="font-quicksand-medium text-sm text-green-700">Total Jobs</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={jobs || []}
        renderItem={({ item }) => <BusinessJobListings job={item} />}
        ItemSeparatorComponent={() => <View className="divider" />}
        ListFooterComponent={() => {
          return isLoading ? <ActivityIndicator size="small" color="green" /> : null;
        }}
      />
    </SafeAreaView>
  );
};

export default MyJobPostings;
