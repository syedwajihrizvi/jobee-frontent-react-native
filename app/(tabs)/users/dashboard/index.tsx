import FavoriteCompany from "@/components/FavoriteCompany";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import UserInterviewCard from "@/components/UserInterviewCard";
import { useProfileCompleteness } from "@/lib/services/useProfileCompleteness";
import { useTopCompanies } from "@/lib/services/useTopCompanies";
import { formatDate, getApplicationStatus } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import useUserStore from "@/store/user.store";
import { InterviewSummary, User } from "@/type";
import { Entypo, Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const { isLoading, profileSummary } = useProfileSummaryStore();
  const { user: userProfile } = useAuthStore();
  const user = userProfile as User;
  const { isLoading: isLoadingProfileCompleteness, data: completeness } = useProfileCompleteness();
  const { data: topCompanies, isLoading: isLoadingTopCompanies } = useTopCompanies();
  const {
    interviews,
    isLoadingInterviews: isLoadingInterviews,
    applications,
    isLoadingApplications,
    hasValidLastApplication,
    fetchLastApplication,
    lastApplication,
    isLoadingLastApplication,
  } = useUserStore();
  const [upcomingInterviews, setUpcomingInterviews] = useState<InterviewSummary[]>();
  const [profileSummaryStats, setProfileSummaryStats] = useState({
    totalInConsideration: 0,
    totalRejections: 0,
    totalApplications: 0,
    totalInterviews: 0,
  });

  useEffect(() => {
    if (!hasValidLastApplication()) {
      fetchLastApplication();
    }
  }, []);
  useEffect(() => {
    if (interviews && !isLoadingInterviews) {
      const upcoming = interviews.filter((interview) => interview.status === "SCHEDULED");
      setUpcomingInterviews(upcoming.slice(0, 3));
      setProfileSummaryStats({ ...profileSummaryStats, totalInterviews: interviews.length });
    }
    if (applications && !isLoadingApplications) {
      const inConsideration = applications.filter((app) => app.status !== "IN_CONSIDERATION");
      const rejections = applications.filter((app) => app.status === "REJECTED");
      setProfileSummaryStats({
        ...profileSummaryStats,
        totalInConsideration: inConsideration.length,
        totalRejections: rejections.length,
        totalApplications: applications.length,
      });
    }
  }, [interviews, isLoadingInterviews, applications, isLoadingApplications]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      <ScrollView showsVerticalScrollIndicator={false}>
        {isLoading && (
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
        )}
        {!isLoading && profileSummary && (
          <>
            <View className="px-6 py-4">
              <Text className="font-quicksand-bold text-2xl text-gray-900">Dashboard</Text>
              <Text className="font-quicksand-medium text-base text-gray-600">
                Welcome back {profileSummary.fullName}! Here is your job search overview.
              </Text>
            </View>
            <View
              className="bg-white mx-6 mb-4 rounded-2xl p-6 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="items-center mb-2">
                <View className="relative mb-4">
                  <View
                    className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center border-4 border-white"
                    style={{
                      shadowColor: "#10b981",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <RenderUserProfileImage user={user} />
                  </View>
                  <View className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white items-center justify-center">
                    <Feather name="check" size={12} color="white" />
                  </View>
                </View>

                <View className="items-center">
                  <Text className="font-quicksand-bold text-2xl text-gray-900 mb-1">{profileSummary.fullName}</Text>
                  {user.title && (
                    <Text className="font-quicksand-semibold text-base text-gray-600 mb-2">
                      {user.title}
                      {user.company ? ` @ ${user.company}` : ""}
                    </Text>
                  )}
                </View>
              </View>
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                      <Feather name="eye" size={12} color="#10b981" />
                    </View>
                    <View>
                      <Text className="font-quicksand-bold text-md text-emerald-900">
                        {profileSummary.profileViews || 0} Profile Views
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text className="font-quicksand-semibold text-md mb-1">Profile Completeness</Text>
              <View className="mb-3">
                {isLoadingProfileCompleteness ? (
                  <ActivityIndicator size="small" color="#3b82f6" className="my-2" />
                ) : (
                  <>
                    <View className="flex-row justify-between mb-2">
                      {completeness?.completeness === 100 ? (
                        <View className="flex-row items-center gap-2">
                          <Feather name="check-circle" size={16} color="#10b981" />
                          <Text className="font-quicksand-medium text-sm text-emerald-600">Profile Complete!</Text>
                        </View>
                      ) : (
                        <Text className="font-quicksand-medium text-sm text-gray-600">Complete your profile</Text>
                      )}
                      <Text className="font-quicksand-bold text-sm text-emerald-600">
                        {completeness?.completeness}%
                      </Text>
                    </View>
                    <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${completeness?.completeness!}%` }}
                      />
                    </View>
                  </>
                )}
              </View>
              <TouchableOpacity
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex-row items-center justify-center gap-2"
                onPress={() => router.push("/userProfile/editProfile")}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-semibold text-emerald-700">
                  {completeness?.completeness === 100 ? "View Profile" : "Complete Profile"}
                </Text>
                <Feather name="edit-3" size={14} color="#10b981" />
              </TouchableOpacity>
            </View>
            {!user?.summary && (
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
                    <View className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center">
                      <Feather name="file-text" size={24} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-xl text-gray-900">Professional Summary</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Ionicons name="sparkles" size={14} color="#fbbf24" />
                        <Text className="font-quicksand-medium text-sm text-emerald-600">
                          AI-powered writing available
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="font-quicksand-medium text-gray-700 mb-6 leading-6">
                    Highlight your skills and experience with a compelling summary. Write your own or let our AI create
                    one for you.
                  </Text>

                  <TouchableOpacity
                    className="bg-emerald-500 rounded-xl px-4 py-4 items-center gap-2 flex-1"
                    style={{
                      shadowColor: "#8b5cf6",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    activeOpacity={0.9}
                    onPress={() => router.push("/userProfile/editProfile/summary")}
                  >
                    <View className="flex-row items-center gap-3">
                      <Ionicons name="sparkles" size={18} color="#fbbf24" />
                      <Text className="font-quicksand-bold text-white text-lg">Add Summary</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
                      onPress={() => router.push("/userProfile/appliedJobs")}
                      activeOpacity={0.8}
                    >
                      <Feather name="send" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-sm mt-2 text-center">Applications</Text>
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
                      onPress={() => router.push("/(tabs)/users/jobs")}
                      activeOpacity={0.8}
                    >
                      <Entypo name="briefcase" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-sm mt-2">Find Job</Text>
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
                      onPress={() => router.push("/userProfile/interviews")}
                      activeOpacity={0.8}
                    >
                      <Feather name="calendar" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-sm mt-2">Interviews</Text>
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
                      onPress={() => router.push("/userProfile/manageDocs")}
                      activeOpacity={0.8}
                    >
                      <Feather name="file" size={24} color="white" />
                      <Text className="font-quicksand-bold text-white text-sm mt-2">Upload Document</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View
              className="bg-white mx-6 mb-4 rounded-2xl p-6 border border-gray-100"
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
                  <MaterialIcons name="pie-chart" size={20} color="#10b981" />
                </View>
                <Text className="font-quicksand-bold text-lg text-gray-900">Applications Overview</Text>
              </View>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Feather name="check-circle" size={16} color="#3b82f6" />
                  <Text className="font-quicksand-semibold text-md">
                    {profileSummaryStats.totalInConsideration} Pending
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather name="clock" size={16} color="#10b981" />
                  <Text className="font-quicksand-semibold text-md">
                    {profileSummaryStats.totalInterviews} In Consideration
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather name="x-circle" size={16} color="#ef4444" />
                  <Text className="font-quicksand-semibold text-md">
                    {profileSummaryStats.totalRejections} Rejected
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-emerald-50 border border-green-200 rounded-xl p-3 mt-4 items-center"
                onPress={() => router.push("/userProfile/appliedJobs")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="eye" size={14} color="#10b981" />
                  <Text className="font-quicksand-semibold text-green-700">View All Applications</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4 items-center"
                onPress={() => router.push("/userProfile/interviews")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="briefcase" size={14} color="blue" />
                  <Text className="font-quicksand-semibold text-blue-700">Find Jobs</Text>
                </View>
              </TouchableOpacity>
            </View>
            {upcomingInterviews && upcomingInterviews.length > 0 && (
              <View className="mx-6 mb-4">
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
                    <TouchableOpacity
                      onPress={() => router.push(`/userProfile/interviews?userId=${user?.id}`)}
                      activeOpacity={0.7}
                    >
                      <Feather name="chevron-right" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                  <View className="gap-3">
                    {upcomingInterviews?.map((interview, index) => (
                      <UserInterviewCard key={index} item={interview} withPadding={false} />
                    ))}
                  </View>
                </View>
              </View>
            )}
            {lastApplication && (
              <View
                className="bg-white mx-6 mb-4 rounded-2xl p-6 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                    <Feather name="clock" size={20} color="#8b5cf6" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Last Application</Text>
                </View>
                {lastApplication && !isLoadingLastApplication && (
                  <TouchableOpacity
                    className="bg-purple-50 border border-purple-200 rounded-xl p-4"
                    onPress={() => router.push(`/jobs/${lastApplication?.job.id}`)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row gap-1 items-center">
                        <RenderCompanyLogo logoUrl={lastApplication.job.companyLogoUrl} />
                        <Text className="font-quicksand-bold text-md text-purple-700">
                          {lastApplication.job.businessName}
                        </Text>
                      </View>

                      <Text className="font-quicksand-semibold text-sm px-2 border border-purple-300 rounded-full text-purple-800">
                        {getApplicationStatus(lastApplication.status)}
                      </Text>
                    </View>
                    <Text className="font-quicksand-medium text-md text-purple-700">{lastApplication.job.title}</Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="font-quicksand-bold text-sm text-purple-900">
                        Applied on {formatDate(lastApplication.appliedAt)}
                      </Text>
                      <Feather name="chevron-right" size={16} color="#6b7280" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View
              className="bg-white mx-6 mb-4 rounded-2xl p-6 border border-gray-100"
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
                    <Feather name="heart" size={20} color="#ef4444" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Favorite Companies</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/userProfile/favoriteCompanies")} activeOpacity={0.7}>
                  <Feather name="chevron-right" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View className="gap-3">
                {profileSummary.favoriteCompanies.length === 0 && (
                  <Text className="font-quicksand-medium text-sm text-gray-600">No favorite companies yet.</Text>
                )}
                {profileSummary.favoriteCompanies.length > 0 &&
                  profileSummary.favoriteCompanies.map((company, index) => (
                    <TouchableOpacity
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
                      activeOpacity={0.7}
                      onPress={() => router.push(`/users/jobs?companyName=${company.name}`)}
                    >
                      <View className="flex-row items-center gap-3">
                        <RenderCompanyLogo logoUrl={company.logoUrl} />
                        <Text className="font-quicksand-semibold text-base text-gray-900">{company.name}</Text>
                      </View>
                      <FavoriteCompany company={company} />
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
            <View
              className="bg-white mx-6 mb-6 rounded-2xl p-6 border border-gray-100"
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
                    <Feather name="trending-up" size={20} color="#f59e0b" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Top Hiring Companies</Text>
                </View>
              </View>
              <View className="gap-3">
                {isLoadingTopCompanies ? (
                  <ActivityIndicator size="small" color="#f59e0b" className="my-2" />
                ) : (
                  <>
                    {topCompanies?.map((company, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => router.push(`/users/jobs?companyName=${company.name}`)}
                        className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-center justify-between"
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center gap-3">
                          <View className="w-8 h-8 bg-amber-200 rounded items-center justify-center">
                            <Text className="font-quicksand-bold text-xs text-amber-800">{index + 1}</Text>
                          </View>
                          <View>
                            <View className="flex-row gap-1 items-center">
                              <RenderCompanyLogo logoUrl={company.logoUrl} />
                              <Text className="font-quicksand-semibold text-base text-gray-900">{company.name}</Text>
                            </View>
                            <Text className="font-quicksand-medium text-sm text-amber-700">
                              {company.jobCount} open position{company.jobCount !== 1 ? "s" : ""}
                            </Text>
                          </View>
                        </View>
                        <Feather name="chevron-right" size={14} color="#f59e0b" />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            </View>
          </>
        )}
        {!isLoading && !profileSummary && <></>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
