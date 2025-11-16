import BusinessJobListings from "@/components/BusinessJobListings";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { useApplicationsForBusinessProfileJobs } from "@/lib/services/useApplicationsForBusinessProfileJobs";
import { formatSWord } from "@/lib/utils";
import useApplicantsForUserJobs from "@/store/applicantsForUserJobs";
import useAuthStore from "@/store/auth.store";
import useBusinessProfileSummaryStore from "@/store/business-profile-summary.store";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import { BusinessUser, InterviewFilter, InterviewFilters } from "@/type";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { setApplications, applications: storeApplications } = useApplicantsForUserJobs();
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
    // Initially we should atleast load upcoming interviews so we can show their count on dashboard
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

  const getApplicantsInLast7Days = () => {
    if (!storeApplications) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return storeApplications.filter((app) => new Date(app.appliedAt) >= sevenDaysAgo).length;
  };

  const renderProfileImage = () => {
    if (user?.profileImageUrl)
      return (
        <Image source={{ uri: getS3BusinessProfileImage(user.profileImageUrl) }} className="w-16 h-16 rounded-full" />
      );
    return (
      <View className="w-28 h-28 bg-gray-100 rounded-full items-center justify-center">
        <Feather name="user" size={40} color="#6b7280" />
      </View>
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
              <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center justify-center">
                <View>{renderProfileImage()}</View>
                <View className="flex-row items-center gap-1">
                  <Text className="font-quicksand-bold text-xl text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <RenderCompanyLogo logoUrl={user?.companyLogo || ""} />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    {user?.title} @ {user?.companyName}
                  </Text>
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
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                    <Feather name="zap" size={20} color="#3b82f6" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Quick Actions</Text>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-green-500 rounded-xl p-4 items-center"
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
                    <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                      <Feather name="clock" size={20} color="#ef4444" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Pending Applications</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/businessJobs/applications")}
                    className="bg-gray-100 rounded-full p-2"
                    activeOpacity={0.7}
                  >
                    <Feather name="chevron-right" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="w-6 h-6 bg-red-200 rounded-full items-center justify-center">
                        <Feather name="file-text" size={12} color="#dc2626" />
                      </View>
                      <Text className="font-quicksand-semibold text-xs text-red-700">Total Pending</Text>
                    </View>
                    <Text className="font-quicksand-bold text-xl text-red-900">{storeApplications?.length || 0}</Text>
                  </View>

                  <View className="flex-1 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="w-6 h-6 bg-orange-200 rounded-full items-center justify-center">
                        <Feather name="calendar" size={12} color="#ea580c" />
                      </View>
                      <Text className="font-quicksand-semibold text-xs text-orange-700">Last 7 Days</Text>
                    </View>
                    <Text className="font-quicksand-bold text-xl text-orange-900">{getApplicantsInLast7Days()}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4"
                  style={{
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => router.push("/businessJobs/applications")}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                          <Feather name="alert-circle" size={16} color="#dc2626" />
                        </View>
                        <Text className="font-quicksand-bold text-base text-red-900">Action Required</Text>
                      </View>
                      <Text className="font-quicksand-medium text-sm text-red-700 leading-5">
                        {applications?.length! > 0
                          ? `Review ${applications?.length} pending applications to keep your hiring process moving`
                          : "No pending applications at the moment"}
                      </Text>
                    </View>

                    <View className="items-center">
                      <View
                        className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mb-2"
                        style={{
                          shadowColor: "#ef4444",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                      >
                        <Feather name="eye" size={20} color="white" />
                      </View>
                      <Text className="font-quicksand-semibold text-xs text-red-600">Review</Text>
                    </View>
                  </View>
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
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                      <Feather name="briefcase" size={20} color="#10b981" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Most Popular Jobs</Text>
                  </View>
                </View>
                <View className="flex-row gap-3 mb-4">
                  <TouchableOpacity
                    className={`px-3 py-1${viewingMostApplied ? " bg-green-100" : ""}  rounded-full`}
                    onPress={() => setViewingMostApplied(true)}
                  >
                    <Text className="font-quicksand-medium text-sm text-green-700">Most Applied</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-1${viewingMostApplied ? "" : " bg-green-100"} rounded-full`}
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
