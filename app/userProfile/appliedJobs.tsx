import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { applicationStatusOptions } from "@/constants";
import { getApplicationStatusFilterTextForUser } from "@/lib/utils";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { ApplicationStatusFilter, Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppliedJobs = () => {
  const { isLoadingApplications: isLoadingAllApplications } = useUserStore();
  const {
    fetchAppliedJobsForUserAndFilter,
    getAppliedJobsByFilter,
    getTotalCountForAppliedJobsByFilter,
    getPaginationForAppliedJobsByFilter,
    isLoadingAppliedJobsForFilter,
    hasValidAppliedJobsCache,
    refreshAppliedJobsForUserAndFilter,
  } = useUserJobsStore();
  const [filter, setFilter] = useState<ApplicationStatusFilter>(null);
  const [showFilters, setShowFilters] = useState(false);

  const applications = getAppliedJobsByFilter(filter);
  const totalCount = getTotalCountForAppliedJobsByFilter(filter);
  const paginatedApplications = getPaginationForAppliedJobsByFilter(filter);
  const isLoadingApplicationsForFilter = isLoadingAppliedJobsForFilter(filter);
  const hasValidCache = hasValidAppliedJobsCache(filter);

  useEffect(() => {
    if (!hasValidCache) {
      refreshAppliedJobsForUserAndFilter(filter);
    }
  }, []);

  useEffect(() => {
    if (!hasValidCache) {
      refreshAppliedJobsForUserAndFilter(filter);
    }
  }, [filter]);

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="Applied Jobs" />
      {isLoadingAllApplications ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full px-4"
          data={applications}
          renderItem={({ item }: { item: Job }) => (
            <JobListing job={item} showQuickApply={true} canQuickApply={false} />
          )}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={() => (
            <>
              <View
                className="mb-6 bg-white rounded-2xl p-5 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                    <Feather name="folder" size={24} color="#6366f1" />
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-xl text-gray-900">
                      {getApplicationStatusFilterTextForUser(filter || "", totalCount)}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      View the status of your job applications
                    </Text>
                  </View>
                </View>
              </View>
              <View
                className="bg-white mb-4 rounded-2xl p-4 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center">
                      <Feather name="filter" size={12} color="#8b5cf6" />
                    </View>
                    <Text className="font-quicksand-bold text-base text-gray-900">Filter Applied Jobs</Text>
                  </View>
                  <TouchableOpacity
                    className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center"
                    onPress={() => setShowFilters(!showFilters)}
                  >
                    <Feather name={`chevron-${showFilters ? "up" : "down"}`} size={16} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
                {showFilters && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {applicationStatusOptions
                      .filter((option) => option.value !== "SHORTLISTED")
                      .map((option) => {
                        const isActive = filter === option.value;
                        return (
                          <TouchableOpacity
                            key={option.label}
                            className="px-3 py-2 rounded-lg"
                            style={{
                              backgroundColor: filter === option.value ? option.activeBgColor : option.bgColor,
                            }}
                            onPress={() => setFilter((isActive ? null : option.value) as ApplicationStatusFilter)}
                          >
                            <Text
                              className="font-quicksand-semibold text-xs"
                              style={{
                                color: filter === option.value ? option.activeTextColor : option.textColor,
                              }}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                )}
              </View>
            </>
          )}
          onEndReached={() => {
            if (paginatedApplications?.hasMore) {
              const nextPage = (paginatedApplications?.currentPage || 0) + 1;
              fetchAppliedJobsForUserAndFilter(filter, nextPage);
            }
          }}
          ListFooterComponent={() => {
            return isLoadingApplicationsForFilter ? <ActivityIndicator size="large" color="#8b5cf6" /> : null;
          }}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default AppliedJobs;
