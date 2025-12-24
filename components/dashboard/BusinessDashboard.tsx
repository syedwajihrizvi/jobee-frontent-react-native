import BusinessJobListings from "@/components/BusinessJobListings";
import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { formatSWord } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import { BusinessUser, InterviewFilter, InterviewFilters, Job } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderBusinessProfileImage from "../RenderBusinessProfileImage";

const filter: InterviewFilters = {
  status: "SCHEDULED" as InterviewFilter,
};

const BusinessDashboard = ({ userType }: { userType: string }) => {
  const { isLoading: isLoadingUser, user: authUser } = useAuthStore();
  const {
    hasValidCachedInterviews,
    refreshInterviewsForJobAndFilter,
    getTotalCountForJobAndFilter,
    isLoadingInterviewsForJobAndFilter,
  } = useBusinessInterviewsStore();
  const {
    fetchMostPopularJobs,
    getMostAppliedJobs,
    getMostViewedJobs,
    hasValidCachedMostPopularJobs,
    loadingMostPopularJobs,
  } = useBusinessJobsStore();
  const [viewingMostApplied, setViewingMostApplied] = useState(true);
  const [popularJobs, setPopularJobs] = useState<Job[]>([]);
  const user = authUser as BusinessUser | null;

  const mostAppliedJobs = getMostAppliedJobs();
  const mostViewedJobs = getMostViewedJobs();

  useEffect(() => {
    const cacheValid = hasValidCachedInterviews(filter);
    if (!cacheValid) {
      refreshInterviewsForJobAndFilter(filter);
    }
  }, []);

  useEffect(() => {
    const cacheValid = hasValidCachedMostPopularJobs();
    if (!cacheValid) {
      fetchMostPopularJobs();
    }
  }, []);

  useEffect(() => {
    if (viewingMostApplied) {
      setPopularJobs(mostAppliedJobs || []);
    } else {
      setPopularJobs(mostViewedJobs || []);
    }
  }, [viewingMostApplied, loadingMostPopularJobs, mostAppliedJobs, mostViewedJobs]);

  const renderProfileImage = () => {
    if (user?.profileImageUrl)
      return (
        <Image source={{ uri: getS3BusinessProfileImage(user.profileImageUrl) }} className="w-16 h-16 rounded-full" />
      );
    return (
      <RenderBusinessProfileImage
        profileImageSize={16}
        fontSize={16}
        firstName={user?.firstName}
        lastName={user?.lastName}
      />
    );
  };

  const renderUpcomingInterviewsText = () => {
    if (interviewCount === 0) {
      return (
        <View className="items-center py-4">
          <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center">
            <Feather name="calendar" size={16} color="#f59e0b" />
          </View>
          <Text className="font-quicksand-bold text-lg text-gray-900">No Upcoming Interviews</Text>
          <Text className="font-quicksand-medium text-sm text-gray-600 text-center">
            Schedule interviews with candidates to see them here.
          </Text>
        </View>
      );
    } else {
      return (
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center">
                  <Feather name="clock" size={16} color="#f59e0b" />
                </View>
                <Text className="font-quicksand-bold text-base text-amber-800">Interviews Scheduled</Text>
              </View>
              <Text className="font-quicksand-medium text-sm text-amber-700">
                You have {interviewCount} upcoming {formatSWord("interview", interviewCount)} scheduled.
              </Text>
            </View>
          </View>
        </View>
      );
    }
  };

  const isLoadingInterviews = isLoadingInterviewsForJobAndFilter(filter);
  const interviewCount = getTotalCountForJobAndFilter(filter);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoadingUser ? (
          <View className="flex-1 justify-center items-center px-6 py-20">
            <View
              className="bg-white rounded-2xl p-8 items-center border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>

              <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">Loading Dashboard</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 text-center leading-5">
                Fetching your dashboard details...
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View className="px-3 mb-4">
              <View
                className="bg-white rounded-xl p-4 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="relative">
                    <View
                      className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center border-3 border-white"
                      style={{
                        shadowColor: "#10b981",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
                      {renderProfileImage()}
                    </View>
                    <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white items-center justify-center">
                      <Feather name="check" size={10} color="white" />
                    </View>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-quicksand-bold text-base text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </Text>
                      <View className="w-5 h-5 bg-emerald-500 rounded-full items-center justify-center">
                        <Feather name="star" size={10} color="white" />
                      </View>
                    </View>
                    <Text className="font-quicksand-bold text-xs text-gray-600">
                      {user?.title ? `${user?.title} @` : ""} {user?.companyName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-emerald-500 rounded-lg px-4 py-2 flex-row items-center justify-center gap-2 mt-3 w-1/2"
                  onPress={() => router.push(`/companies/${user?.companyId}`)}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="building" size={12} color="white" />
                  <Text className="font-quicksand-bold text-white text-xs">View Company Profile</Text>
                  <Feather name="arrow-right" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="px-3 mb-4">
              <View
                className="bg-white rounded-2xl p-5 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                    <Feather name="zap" size={16} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-base text-gray-900">Quick Actions</Text>
                </View>

                <View className="gap-3">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 bg-teal-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#14b8a6",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/businessProfile/manageUsers")}
                      activeOpacity={0.8}
                    >
                      <Feather name="send" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1">Invite to Jobee</Text>
                    </TouchableOpacity>
                    {userType !== "EMPLOYEE" && (
                      <TouchableOpacity
                        className="flex-1 bg-green-500 rounded-lg px-3 py-3 items-center justify-center"
                        style={{
                          shadowColor: "#22c55e",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                        onPress={() => router.push("/businessJobs/createJob")}
                        activeOpacity={0.8}
                      >
                        <Feather name="calendar" size={18} color="white" />
                        <Text className="font-quicksand-bold text-white text-xs mt-1">Create Job</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 bg-purple-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#8b5cf6",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/(tabs)/business/jobs")}
                      activeOpacity={0.8}
                    >
                      <Feather name="folder" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center">View Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-indigo-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#6366f1",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/businessProfile/interviews")}
                      activeOpacity={0.8}
                    >
                      <Feather name="book" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center">Interviews</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View className="px-3 mb-4">
              <View
                className="bg-white rounded-2xl p-6 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center">
                      <Feather name="calendar" size={16} color="#f59e0b" />
                    </View>
                    <Text className="font-quicksand-bold text-md text-gray-900">Upcoming Interviews</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push("/businessProfile/interviews?status=SCHEDULED")}>
                    <Feather name="chevron-right" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View>
                  {isLoadingInterviews ? (
                    <ActivityIndicator size="large" color="#f59e0b" />
                  ) : (
                    renderUpcomingInterviewsText()
                  )}
                </View>
              </View>
            </View>
            {popularJobs.length > 0 ? (
              <View className="px-3 mb-4">
                <View
                  className="bg-white rounded-2xl p-6 border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                        <Feather name="briefcase" size={16} color="#10b981" />
                      </View>
                      <Text className="font-quicksand-bold text-md text-gray-900">Most Popular Jobs</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-3 mb-4">
                    <TouchableOpacity
                      className={`px-3 py-1${viewingMostApplied ? " bg-emerald-100" : ""}  rounded-full`}
                      onPress={() => setViewingMostApplied(true)}
                    >
                      <Text className="font-quicksand-medium text-sm text-green-700">Most Applied</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`px-3 py-1${viewingMostApplied ? "" : " bg-emerald-100"} rounded-full`}
                      onPress={() => setViewingMostApplied(false)}
                    >
                      <Text className="font-quicksand-medium text-sm text-green-700">Most Viewed</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="gap-3">
                    {popularJobs.map((job, index) => (
                      <BusinessJobListings key={index} job={job} />
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View className="px-3 mb-4">
                <View
                  className="bg-white rounded-2xl p-6 border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <View className="items-center py-6">
                    <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mb-1">
                      <Feather name="briefcase" size={16} color="#10b981" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">
                      {user?.role === "EMPLOYEE" ? "No Jobs Available" : "No Jobs Posted Yet"}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-gray-600 text-center mb-4 px-4">
                      {user?.role === "EMPLOYEE"
                        ? "When you get added to hiring teams for jobs, they'll appear here."
                        : "Start attracting top talent by posting your first job listing."}
                    </Text>
                    {user?.role !== "EMPLOYEE" && (
                      <TouchableOpacity
                        className="bg-emerald-500 rounded-lg px-6 py-3 flex-row items-center gap-2"
                        style={{
                          shadowColor: "#10b981",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                        onPress={() => router.push("/businessJobs/createJob")}
                        activeOpacity={0.8}
                      >
                        <Feather name="plus" size={16} color="white" />
                        <Text className="font-quicksand-bold text-white text-sm">Post First Job</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessDashboard;
