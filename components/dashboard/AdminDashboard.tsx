import BusinessJobListings from "@/components/BusinessJobListings";
import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { useApplicationsForBusinessProfileJobs } from "@/lib/services/useApplicationsForBusinessProfileJobs";
import { formatSWord } from "@/lib/utils";
import useApplicantsForUserJobs from "@/store/applicantsForUserJobs";
import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import { BusinessUser, InterviewFilter, InterviewFilters } from "@/type";
import { Entypo, Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RenderBusinessProfileImage from "../RenderBusinessProfileImage";

const filter: InterviewFilters = {
  status: "SCHEDULED" as InterviewFilter,
};

const AdminDashboard = () => {
  const { isLoading: isLoadingUser, user: authUser } = useAuthStore();
  const { profileSummary } = useBusinessProfileSummaryStore();
  const {
    hasValidCachedInterviews,
    refreshInterviewsForJobAndFilter,
    getTotalCountForJobAndFilter,
    isLoadingInterviewsForJobAndFilter,
  } = useBusinessInterviewsStore();
  const { setApplications } = useApplicantsForUserJobs();
  const { data: applications, isLoading: isLoadingApplications } = useApplicationsForBusinessProfileJobs({
    userId: authUser?.id,
  });
  const [viewingMostApplied, setViewingMostApplied] = useState(true);
  const [popularJobs, setPopularJobs] = useState(profileSummary?.mostAppliedJobs || []);
  const user = authUser as BusinessUser | null;

  useEffect(() => {
    const cacheValid = hasValidCachedInterviews(filter);
    if (!cacheValid) {
      refreshInterviewsForJobAndFilter(filter);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingApplications) {
      setApplications(applications || []);
    }
  }, [setApplications, isLoadingApplications, applications]);

  useEffect(() => {
    if (viewingMostApplied) {
      setPopularJobs(profileSummary?.mostAppliedJobs || []);
    } else {
      setPopularJobs(profileSummary?.mostViewedJobs || []);
    }
  }, [viewingMostApplied, profileSummary]);

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
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Feather name="calendar" size={24} color="#6b7280" />
          </View>
          <Text className="font-quicksand-bold text-base text-gray-900 mb-1">No Upcoming Interviews</Text>
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
            <View className="px-3 py-4">
              <Text className="font-quicksand-bold text-2xl text-gray-900">Business Dashboard</Text>
              <Text className="font-quicksand-medium text-base text-gray-600">
                Welcome {user?.firstName} {user?.lastName}! Manage your hiring process and track recruitment metrics.
              </Text>
            </View>
            <View className="px-3 py-4">
              <View
                className="rounded-2xl p-6 border border-emerald-200 items-center justify-center"
                style={{
                  backgroundColor: "#10b981",
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="mb-3">{renderProfileImage()}</View>
                <View className="flex-row items-center gap-1 mb-2">
                  <Text className="font-quicksand-bold text-xl text-white">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <View className="w-6 h-6 bg-amber-400 rounded-full items-center justify-center ml-2">
                    <Feather name="star" size={12} color="#10b981" />
                  </View>
                </View>

                <View className="flex-row items-center gap-2 mb-4">
                  <Text className="font-quicksand-semibold text-sm text-emerald-100">
                    {user?.title ? `${user?.title} @` : ""} {user?.companyName}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-white rounded-lg px-6 py-3 flex-row items-center gap-2"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() => router.push(`/companies/${user?.companyId}`)}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="building" size={16} color="#10b981" />
                  <Text className="font-quicksand-bold text-emerald-600 text-sm">View Company Profile</Text>
                  <Feather name="arrow-right" size={14} color="#10b981" />
                </TouchableOpacity>
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
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                    <Feather name="zap" size={20} color="#3b82f6" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Quick Actions</Text>
                </View>
                <View className="gap-2">
                  <View className="flex-row gap-3 flex-wrap">
                    <TouchableOpacity
                      className="flex-1 bg-amber-500 rounded-xl p-4 items-center"
                      style={{
                        shadowColor: "#22c55e",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                      onPress={() => router.push("/businessProfile/manageUsers")}
                      activeOpacity={0.8}
                    >
                      <Feather name="send" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-2 text-center">Invite to Jobee</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-emerald-500 rounded-xl p-4 items-center"
                      style={{
                        shadowColor: "#22c55e",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                      onPress={() => router.push("/businessJobs/createJob")}
                      activeOpacity={0.8}
                    >
                      <Entypo name="circle-with-plus" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-2">Create Job</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row gap-3 flex-wrap">
                    <TouchableOpacity
                      className="flex-1 bg-blue-500 rounded-xl p-4 items-center"
                      style={{
                        shadowColor: "#3b82f6",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                      onPress={() => router.push("/business/jobs")}
                      activeOpacity={0.8}
                    >
                      <Feather name="briefcase" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-2">View Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-purple-500 rounded-xl p-4 items-center"
                      style={{
                        shadowColor: "#8b5cf6",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                      onPress={() => router.push("/businessProfile/interviews")}
                      activeOpacity={0.8}
                    >
                      <Feather name="calendar" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-2">Interviews</Text>
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
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                    <MaterialIcons name="analytics" size={20} color="#10b981" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Company Metrics</Text>
                </View>
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-1 min-w-[45%] bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <Text className="font-quicksand-bold text-2xl text-blue-700">
                      {profileSummary?.totalJobsPosted}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-blue-600">Active Jobs</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <Text className="font-quicksand-bold text-2xl text-emerald-700">
                      {profileSummary?.totalApplicationsReceived}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-emerald-600">Total Applications</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <Text className="font-quicksand-bold text-2xl text-orange-700">
                      {profileSummary?.totalJobViews}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-orange-600">Total Job Views</Text>
                  </View>
                  <View className="flex-1 min-w-[45%] bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <Text className="font-quicksand-bold text-2xl text-purple-700">
                      {profileSummary?.totalInterviewsScheduled}
                    </Text>
                    <Text className="font-quicksand-medium text-sm text-purple-600">Interviews Scheduled</Text>
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
                    <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                      <Feather name="calendar" size={20} color="#f59e0b" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Upcoming Interviews</Text>
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
            {popularJobs.length > 0 && (
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
                      <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                        <Feather name="briefcase" size={20} color="#10b981" />
                      </View>
                      <Text className="font-quicksand-bold text-lg text-gray-900">Most Popular Jobs</Text>
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
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
