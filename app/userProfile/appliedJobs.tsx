import BackBar from "@/components/BackBar";
import InterviewFilterButton from "@/components/InterviewFilterButton";
import JobListing from "@/components/JobListing";
import useUserStore from "@/store/user.store";
import { Application } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppliedJobsFilter =
  | "Pending"
  | "Rejected"
  | "Offered"
  | "Interviewed"
  | "Interview Scheduled"
  | "Interview Completed"
  | null;
const AppliedJobs = () => {
  const { isLoadingApplications, applications } = useUserStore();
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<AppliedJobsFilter>(null);
  const [showFilters, setShowFilters] = useState(false);
  const getCountOfJobsByStatus = (status: string) => {
    if (status === "PENDING") {
      return applications ? applications.filter((j) => j.status === "PENDING").length : 0;
    } else if (status === "INTERVIEW_SCHEDULED") {
      return applications ? applications.filter((j) => j.status === "INTERVIEW_SCHEDULED").length : 0;
    } else if (status === "INTERVIEW_COMPLETED") {
      return applications ? applications.filter((j) => j.status === "INTERVIEW_COMPLETED").length : 0;
    } else if (status === "INTERVIEWED") {
      return applications ? applications.filter((j) => j.status === "INTERVIEWED").length : 0;
    } else if (status === "OFFERED") {
      return applications ? applications.filter((j) => j.status === "OFFERED").length : 0;
    } else if (status === "REJECTED") {
      return applications ? applications.filter((j) => j.status === "REJECTED").length : 0;
    }
    return applications ? applications.length : 0;
  };

  useEffect(() => {
    if (applications && !isLoadingApplications) {
      let filtered = [...applications];
      if (filter) {
        if (filter === "Pending") {
          filtered = filtered.filter((j) => j.status === "PENDING");
        } else if (filter === "Interview Scheduled") {
          filtered = filtered.filter((j) => j.status === "INTERVIEW_SCHEDULED");
        } else if (filter === "Interview Completed") {
          filtered = filtered.filter((j) => j.status === "INTERVIEW_COMPLETED");
        } else if (filter === "Interviewed") {
          filtered = filtered.filter((j) => j.status === "INTERVIEWED");
        } else if (filter === "Offered") {
          filtered = filtered.filter((j) => j.status === "OFFERED");
        } else if (filter === "Rejected") {
          filtered = filtered.filter((j) => j.status === "REJECTED");
        }
      }
      setFilteredApplications([...filtered]);
    }
  }, [applications, isLoadingApplications, filter]);

  const getIcon = (filter: AppliedJobsFilter, size: number = 12) => {
    switch (filter) {
      case "Pending":
        return <Feather name="clock" size={size} color="#3b82f6" />;
      case "Interview Scheduled":
        return <Feather name="calendar" size={size} color="#f59e0b" />;
      case "Interview Completed":
        return <Feather name="check-circle" size={size} color="#8b5cf6" />;
      case "Offered":
        return <MaterialIcons name="celebration" size={size} color="#10b981" />;
      case "Rejected":
        return <Feather name="x-circle" size={size} color="#ef4444" />;
      default:
        return <Feather name="briefcase" size={size} color="#6b7280" />;
    }
  };

  const renderEmptyComponent = () => {
    const getEmptyStateConfig = () => {
      switch (filter) {
        case "Pending":
          return {
            icon: getIcon("Pending", 40),
            title: "No Pending Applications",
            description: "You don't have any applications currently pending review.",
            color: "#3b82f6",
          };
        case "Interview Scheduled":
          return {
            icon: getIcon("Interview Scheduled", 40),
            title: "No Scheduled Interviews",
            description: "You don't have any interviews scheduled at the moment.",
            color: "#f59e0b",
          };
        case "Interview Completed":
          return {
            icon: getIcon("Interview Completed", 40),
            title: "No Completed Interviews",
            description: "You haven't completed any interviews yet.",
            color: "#8b5cf6",
          };
        case "Offered":
          return {
            icon: getIcon("Offered", 40),
            title: "No Job Offers",
            description: "You haven't received any job offers yet. Keep applying!",
            color: "#10b981",
          };
        case "Rejected":
          return {
            icon: getIcon("Rejected", 40),
            title: "No Rejections",
            description: "Great news! You don't have any rejections.",
            color: "#ef4444",
          };
        default:
          return {
            icon: getIcon("Pending"),
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
          {config.icon}
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
      {isLoadingApplications ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full p-2"
          data={filteredApplications || []}
          renderItem={({ item, index }: { item: Application; index: number }) => (
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
                      count={applications ? applications.length : 0}
                      label="All"
                      isActive={filter == null}
                      icon={null}
                      theme="indigo"
                      shadowColor="#6366f1"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Pending")}
                      count={getCountOfJobsByStatus("PENDING")}
                      label="Pending"
                      isActive={filter === "Pending"}
                      icon={getIcon("Pending")}
                      theme="blue"
                      shadowColor="#3b82f6"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Interview Scheduled")}
                      count={getCountOfJobsByStatus("INTERVIEW_SCHEDULED")}
                      label="Interview Scheduled"
                      isActive={filter === "Interview Scheduled"}
                      icon={getIcon("Interview Scheduled")}
                      theme="amber"
                      shadowColor="#f59e0b"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Interview Completed")}
                      count={getCountOfJobsByStatus("INTERVIEW_COMPLETED")}
                      label="Interview Completed"
                      isActive={filter === "Interview Completed"}
                      icon={getIcon("Interview Completed")}
                      theme="purple"
                      shadowColor="#8b5cf6"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Rejected")}
                      count={getCountOfJobsByStatus("REJECTED")}
                      label="Rejected"
                      isActive={filter === "Rejected"}
                      icon={getIcon("Rejected")}
                      theme="red"
                      shadowColor="#ef4444"
                    />
                    <InterviewFilterButton
                      handlePress={() => setFilter("Offered")}
                      count={getCountOfJobsByStatus("OFFERED")}
                      label="Offered"
                      isActive={filter === "Offered"}
                      icon={getIcon("Offered")}
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
