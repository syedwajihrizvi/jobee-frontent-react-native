import BackBar from "@/components/BackBar";
import InterviewFilterButton from "@/components/InterviewFilterButton";
import JobListing from "@/components/JobListing";
import { useJobsByUserApplications } from "@/lib/services/useJobs";
import useAuthStore from "@/store/auth.store";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppliedJobsFilter = "Pending" | "Rejected" | "Offered" | "Interviewed" | "Interview Scheduled" | null;
const AppliedJobs = () => {
  const { user } = useAuthStore();
  const { data, isLoading: isLoadingJobs } = useJobsByUserApplications(user?.id);

  const [jobs, setJobs] = useState(data || []);
  const [filter, setFilter] = useState<AppliedJobsFilter>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getCountOfJobsByStatus = (status: string) => {
    if (status === "PENDING") {
      return data ? data.filter((j) => j.status === "PENDING").length : 0;
    } else if (status === "INTERVIEW_SCHEDULED") {
      return data ? data.filter((j) => j.status === "INTERVIEW_SCHEDULED").length : 0;
    } else if (status === "INTERVIEWED") {
      return data ? data.filter((j) => j.status === "INTERVIEWED").length : 0;
    } else if (status === "OFFERED") {
      return data ? data.filter((j) => j.status === "OFFERED").length : 0;
    } else if (status === "REJECTED") {
      return data ? data.filter((j) => j.status === "REJECTED").length : 0;
    }
    return data ? data.length : 0;
  };

  useEffect(() => {
    if (data && !isLoadingJobs) {
      let filteredJobs = [...data];
      if (filter) {
        if (filter === "Pending") {
          filteredJobs = filteredJobs.filter((j) => j.status === "PENDING");
        } else if (filter === "Interview Scheduled") {
          filteredJobs = filteredJobs.filter((j) => j.status === "INTERVIEW_SCHEDULED");
        } else if (filter === "Interviewed") {
          filteredJobs = filteredJobs.filter((j) => j.status === "INTERVIEWED");
        } else if (filter === "Offered") {
          filteredJobs = filteredJobs.filter((j) => j.status === "OFFERED");
        } else if (filter === "Rejected") {
          filteredJobs = filteredJobs.filter((j) => j.status === "REJECTED");
        }
      }
      setJobs(filteredJobs);
    }
  }, [data, isLoadingJobs, filter]);

  const renderJobsSelectedFor = () => {
    const totalJobs = !jobs || jobs.length === 0 ? 0 : jobs.filter((job) => job.status === "SELECTED").length;
    if (totalJobs === 0) {
      return (
        <View className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <Text className="font-quicksand-bold text-2xl text-emerald-600">
            {getCountOfJobsByStatus("INTERVIEW_SCHEDULED")}
          </Text>
          <Text className="font-quicksand-medium text-sm text-emerald-700">Interviews so far</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <Text className="font-quicksand-bold text-2xl text-emerald-600">{totalJobs}</Text>
        <Text className="font-quicksand-medium text-sm text-emerald-700">{`Interview${totalJobs > 1 ? "s" : ""}`}</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    const getEmptyStateConfig = () => {
      switch (filter) {
        case "Pending":
          return {
            icon: "clock",
            title: "No Pending Applications",
            description: "You don't have any applications currently pending review.",
            color: "#3b82f6",
          };
        case "Interview Scheduled":
          return {
            icon: "calendar",
            title: "No Scheduled Interviews",
            description: "You don't have any interviews scheduled at the moment.",
            color: "#f59e0b",
          };
        case "Interviewed":
          return {
            icon: "users",
            title: "No Completed Interviews",
            description: "You haven't completed any interviews yet.",
            color: "#8b5cf6",
          };
        case "Offered":
          return {
            icon: "check-circle",
            title: "No Job Offers",
            description: "You haven't received any job offers yet. Keep applying!",
            color: "#10b981",
          };
        case "Rejected":
          return {
            icon: "x-circle",
            title: "No Rejections",
            description: "Great news! You don't have any rejections.",
            color: "#ef4444",
          };
        default:
          return {
            icon: "briefcase",
            title: "No Applied Jobs",
            description: "You haven't applied to any jobs yet. Start exploring opportunities!",
            color: "#6b7280",
          };
      }
    };

    const config = getEmptyStateConfig();

    return (
      <View className="flex-1 justify-center items-center px-6 py-12">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
          style={{
            backgroundColor: `${config.color}15`, // 15% opacity
          }}
        >
          <Feather name={config.icon as any} size={40} color={config.color} />
        </View>

        <Text className="font-quicksand-bold text-xl text-gray-900 text-center mb-3">{config.title}</Text>

        <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6 mb-6">
          {config.description}
        </Text>
        {!filter && (
          <TouchableOpacity
            className="bg-indigo-500 rounded-xl px-6 py-3 flex-row items-center gap-2"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={() => {
              // Navigate to job search or home
              // router.push('/jobs') or router.back()
            }}
            activeOpacity={0.8}
          >
            <Feather name="search" size={16} color="white" />
            <Text className="font-quicksand-bold text-white text-base">Browse Jobs</Text>
          </TouchableOpacity>
        )}
        {filter === "Rejected" && (
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl px-6 py-3 flex-row items-center gap-2"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={() => {
              // Navigate to job search
              // router.push('/jobs')
            }}
            activeOpacity={0.8}
          >
            <Feather name="arrow-right" size={16} color="white" />
            <Text className="font-quicksand-bold text-white text-base">Keep Applying</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="Applied Jobs" />
      {isLoadingJobs ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full p-2"
          data={jobs || []}
          renderItem={({ item, index }: { item: { job: Job; status: string; appliedAt: string }; index: number }) => (
            <JobListing
              key={index}
              job={item.job}
              showFavorite={false}
              showStatus={true}
              showQuickApply={true}
              canQuickApply={false}
              status={item.status}
              appliedAt={item.appliedAt}
            />
          )}
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
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                    <Feather name="folder" size={24} color="#6366f1" />
                  </View>
                  <View>
                    <Text className="font-quicksand-bold text-xl text-gray-900">Job Applications</Text>
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
                    <InterviewFilterButton
                      handlePress={() => setFilter(null)}
                      count={data ? data.length : 0}
                      label="All"
                      isActive={filter == null}
                      iconName="list"
                      iconColor="#6366f1"
                      theme="indigo"
                      shadowColor="#6366f1"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Pending")}
                      count={getCountOfJobsByStatus("PENDING")}
                      label="Pending"
                      isActive={filter === "Pending"}
                      iconName="clock"
                      iconColor="#3b82f6"
                      theme="blue"
                      shadowColor="#3b82f6"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Interview Scheduled")}
                      count={getCountOfJobsByStatus("INTERVIEW_SCHEDULED")}
                      label="Interview Scheduled"
                      isActive={filter === "Interview Scheduled"}
                      iconName="calendar"
                      iconColor="#f59e0b"
                      theme="amber"
                      shadowColor="#f59e0b"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Rejected")}
                      count={getCountOfJobsByStatus("REJECTED")}
                      label="Rejected"
                      isActive={filter === "Rejected"}
                      iconName="x-circle"
                      iconColor="#ef4444"
                      theme="red"
                      shadowColor="#ef4444"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Offered")}
                      count={getCountOfJobsByStatus("OFFERED")}
                      label="Offered"
                      isActive={filter === "Offered"}
                      iconName="check-circle"
                      iconColor="#10b981"
                      theme="green"
                      shadowColor="#10b981"
                    />
                  </View>
                )}
              </View>
            </>
          )}
          ListEmptyComponent={() => renderEmptyComponent()}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default AppliedJobs;
