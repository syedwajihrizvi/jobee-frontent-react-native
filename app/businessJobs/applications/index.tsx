import BackBar from "@/components/BackBar";
import SearchBar from "@/components/SearchBar";
import { images } from "@/constants";
import { useUserJobPostings } from "@/lib/services/useUserJobPostings";
import { formatDate, getEmploymentType, getWorkArrangement } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { BusinessUser } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PendingApplications = () => {
  const { user: authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const { isLoading, data: jobs } = useUserJobPostings((authUser as BusinessUser).id, search);
  const [totalPendingApplications, setTotalPendingApplications] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      let pendingCount = 0;
      let applicationsCount = 0;
      jobs.forEach((job) => {
        pendingCount += job.pendingApplicationsSize;
        applicationsCount += job.applicants;
      });
      setTotalPendingApplications(pendingCount);
      setTotalApplications(applicationsCount);
    }
  }, [jobs, isLoading]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar hidden={true} />
      <BackBar label="Pending Applications" />
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
            <Text className="font-quicksand-bold text-xl text-gray-900">Applications</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">
              View Applications that need to be reviewed.
            </Text>
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <Text className="font-quicksand-bold text-2xl text-blue-600">{totalApplications}</Text>
            <Text className="font-quicksand-medium text-sm text-blue-700">Total Applications</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
            <Text className="font-quicksand-bold text-2xl text-green-600">{totalPendingApplications}</Text>
            <Text className="font-quicksand-medium text-sm text-green-700">Pending Applications</Text>
          </View>
        </View>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={jobs || []}
        renderItem={({ item }) => (
          <View
            className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <View className="flex flex-row items-center justify-between mb-2">
                  <Text className="font-quicksand-bold text-xl text-gray-900 leading-6">{item.title}</Text>
                  <View className="flex-row items-center justify-between  border-gray-100">
                    <View className="flex-row items-center gap-2">
                      <View className="flex-row items-center gap-1">
                        <Feather name="calendar" size={14} color="#6b7280" />
                        <Text className="font-quicksand-medium text-sm text-gray-600">
                          Posted: {formatDate(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 mb-2 flex-wrap">
                  <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">{item.location}</Text>
                  </View>
                  <View className="w-1 h-1 bg-gray-400 rounded-full" />
                  <View className="flex-row items-center gap-1">
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {getEmploymentType(item.employmentType)}
                    </Text>
                  </View>
                  <View className="w-1 h-1 bg-gray-400 rounded-full" />
                  <View className="flex-row items-center gap-1">
                    <Feather name="home" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {getWorkArrangement(item.setting)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-base text-emerald-600">
                    ${item.minSalary?.toLocaleString()} - ${item.maxSalary?.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
            {item.pendingApplicationsSize > 0 && (
              <TouchableOpacity
                className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3"
                onPress={() => router.push(`/businessJobs/applications/${item.id}?initialFilter=pending`)}
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-6 h-6 bg-red-100 rounded-full items-center justify-center">
                      <Feather name="alert-circle" size={12} color="#dc2626" />
                    </View>
                    <Text className="font-quicksand-bold text-sm text-red-800">
                      {item.pendingApplicationsSize} pending application{item.pendingApplicationsSize !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#dc2626" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View className="divider mx-4" />}
        ListFooterComponent={() => {
          return isLoading ? <ActivityIndicator size="small" color="green" /> : null;
        }}
      />
    </SafeAreaView>
  );
};

export default PendingApplications;
