import BackBar from "@/components/BackBar";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import SearchBar from "@/components/SearchBar";
import { useUserJobPostings } from "@/lib/services/useUserJobPostings";
import { formatDate, getEmploymentType, getWorkArrangement } from "@/lib/utils";
import useApplicantsForUserJobs from "@/store/applicantsForUserJobs";
import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import { BusinessUser } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PendingApplications = () => {
  const { user: authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const { isLoading, data: jobs } = useUserJobPostings((authUser as BusinessUser).id, search);
  const { applications, setApplications } = useApplicantsForUserJobs();
  const { profileSummary } = useBusinessProfileSummaryStore();
  const [totalPendingApplications, setTotalPendingApplications] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const user = authUser as BusinessUser | null;
  useEffect(() => {
    const pendingCount = applications.filter((app) => app.status === "PENDING").length;
    setTotalPendingApplications(pendingCount);
    setTotalApplications(profileSummary?.totalApplicationsReceived || 0);
  }, [setApplications, applications, profileSummary, jobs]);

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
            <RenderCompanyLogo logoUrl={user?.companyLogo || ""} />
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
          <View className="flex-1 bg-emerald-50 rounded-xl p-4 border border-green-100">
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
                <Text className="font-quicksand-bold text-xl text-gray-900 leading-6 mb-1" numberOfLines={2}>
                  {item.title}
                </Text>
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1">
                      <Feather name="calendar" size={14} color="#6b7280" />
                      <Text className="font-quicksand-medium text-sm text-gray-600">
                        Posted: {formatDate(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 mb-2 flex-wrap">
                  <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {item.location || `${item.city}, ${item.country}`}
                    </Text>
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
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View
              className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
              style={{
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Feather name="file-text" size={32} color="#3b82f6" />
            </View>

            <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">
              No Pending Applications Found
            </Text>
            <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6 mb-6 max-w-xs">
              There are no pending applications for your job postings at the moment. Check back later or review all
              applications.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default PendingApplications;
