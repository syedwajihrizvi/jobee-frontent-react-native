import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { applicationStatusOptions } from "@/constants";
import { getApplicationStatusFilterTextForUser } from "@/lib/utils";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { ApplicationStatusFilter, Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

  const renderEmptyComponent = useMemo(() => {
    if (filter == null && totalCount === 0) {
      return {
        icon: (
          <View
            className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="briefcase" size={32} color="#10b981" />
          </View>
        ),
        title: "No Job Applications Yet",
        description:
          "Start your job search journey! Browse available positions and apply to jobs that match your skills and interests.",
        subtitle: "Get started by exploring job opportunities",
        buttonText: "Browse Jobs",
        onButtonPress: () => router.push("/(tabs)/users/jobs"),
      };
    } else if (filter === "PENDING" && totalCount === 0) {
      return {
        icon: (
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
            <Feather name="clock" size={32} color="#3b82f6" />
          </View>
        ),
        title: "No Pending Applications",
        description:
          "You have no job applications currently pending. Explore new job opportunities and apply to positions that interest you.",
        subtitle: "Keep track of your applications here",
        buttonText: "Browse Jobs",
        onButtonPress: () => router.push("/(tabs)/users/jobs"),
      };
    } else if (filter === "REJECTED" && totalCount === 0) {
      return {
        icon: (
          <View
            className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="x-circle" size={32} color="#ef4444" />
          </View>
        ),
        title: "No Rejected Applications",
        description:
          "Great news! You have no rejected job applications. Keep applying to positions that match your skills and interests.",
        subtitle: "Stay positive and keep exploring",
        buttonText: "Browse Jobs",
        onButtonPress: () => router.push("/(tabs)/users/jobs"),
      };
    } else if (filter === "INTERVIEW_SCHEDULED" && totalCount === 0) {
      return {
        icon: (
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
            <Feather name="calendar" size={32} color="#f59e0b" />
          </View>
        ),
        title: "No Scheduled Interviews",
        description:
          "You have no interviews scheduled at the moment. Keep applying to jobs and prepare for upcoming opportunities.",
        subtitle: "Your next interview could be just around the corner",
        buttonText: "Browse Jobs",
        onButtonPress: () => router.push("/(tabs)/users/jobs"),
      };
    } else if (filter === "INTERVIEW_COMPLETED" && totalCount === 0) {
      return {
        icon: (
          <View
            className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#a855f7",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="check-circle" size={32} color="#a855f7" />
          </View>
        ),
        title: "No Completed Interviews",
        description:
          "You have no completed interviews recorded. Keep applying and preparing for future interview opportunities.",
        subtitle: "Every interview is a step closer to your dream job",
        buttonText: "Browse Jobs",
        onButtonPress: () => router.push("/(tabs)/users/jobs"),
      };
    } else if (filter === "OFFER_MADE" && totalCount === 0) {
      return {
        icon: (
          <View
            className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="award" size={32} color="#10b981" />
          </View>
        ),
        title: "No Job Offers Yet",
        description:
          "You have no job offers at the moment. Keep applying and interviewing to increase your chances of receiving an offer.",
        subtitle: "Your dream job could be just an application away",
        buttonText: "Browse Jobs",
        onButtonPress: () => router.push("/(tabs)/users/jobs"),
      };
    }
    return null;
  }, [filter, totalCount]);

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="Applied Jobs" />
      {isLoadingAllApplications ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full px-4 mt-4"
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
          ListEmptyComponent={() =>
            renderEmptyComponent ? (
              <View className="flex-1 items-center justify-center py-12 px-6">
                {renderEmptyComponent.icon}
                <Text className="font-quicksand-bold text-lg text-gray-900 mb-2 text-center">
                  {renderEmptyComponent.title}
                </Text>
                <Text className="font-quicksand-medium text-base text-gray-600 mb-2 text-center">
                  {renderEmptyComponent.description}
                </Text>
                <Text className="font-quicksand-medium text-sm text-gray-500 mb-4 text-center">
                  {renderEmptyComponent.subtitle}
                </Text>
                <TouchableOpacity
                  className="bg-emerald-500 px-6 py-3 rounded-xl"
                  onPress={renderEmptyComponent.onButtonPress}
                >
                  <Text className="font-quicksand-bold text-white text-base">{renderEmptyComponent.buttonText}</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default AppliedJobs;
