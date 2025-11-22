import FavoriteCompany from "@/components/FavoriteCompany";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import UserInterviewCard from "@/components/UserInterviewCard";
import { useProfileCompleteness } from "@/lib/services/useProfileCompleteness";
import { formatDate, getApplicationStatus } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import useUserStore from "@/store/user.store";
import { InterviewSummary, User } from "@/type";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const { isLoading, profileSummary } = useProfileSummaryStore();
  const { user: userProfile } = useAuthStore();
  const user = userProfile as User;
  const { isLoading: isLoadingProfileCompleteness, data: completeness } = useProfileCompleteness();
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
            <View className="px-3 py-4">
              <Text className="font-quicksand-bold text-2xl text-gray-900">Dashboard</Text>
              <Text className="font-quicksand-medium text-base text-gray-600">
                Welcome back {profileSummary.fullName}! Here is your job search overview.
              </Text>
            </View>
            <View
              className="bg-white mx-3 mb-4 rounded-2xl p-4 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center gap-4 mb-3">
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
                    <RenderUserProfileImage user={user} />
                  </View>
                  <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white items-center justify-center">
                    <Feather name="check" size={10} color="white" />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="font-quicksand-bold text-lg text-gray-900">{profileSummary.fullName}</Text>
                  {user.title && (
                    <Text className="font-quicksand-semibold text-sm text-gray-600">
                      {user.title}
                      {user.company ? ` @ ${user.company}` : ""}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-2 mt-1">
                    <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center">
                      <Feather name="eye" size={8} color="#10b981" />
                    </View>
                    <Text className="font-quicksand-medium text-xs text-emerald-600">
                      {profileSummary.profileViews || 0} views
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-3">
                {isLoadingProfileCompleteness ? (
                  <ActivityIndicator size="small" color="#3b82f6" className="my-1" />
                ) : (
                  <>
                    <View className="flex-row justify-between items-center mb-2">
                      {completeness?.completeness === 100 ? (
                        <View className="flex-row items-center gap-2">
                          <Feather name="check-circle" size={14} color="#10b981" />
                          <Text className="font-quicksand-medium text-sm text-emerald-600">Complete!</Text>
                        </View>
                      ) : (
                        <Text className="font-quicksand-medium text-sm text-gray-600">Profile Progress</Text>
                      )}
                      <Text className="font-quicksand-bold text-sm text-emerald-600">
                        {completeness?.completeness}%
                      </Text>
                    </View>
                    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${completeness?.completeness!}%` }}
                      />
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-4 flex-row items-center justify-center gap-2"
                onPress={() => router.push("/userProfile/editProfile")}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-semibold text-emerald-700 text-sm">
                  {completeness?.completeness === 100 ? "View Profile" : "Complete Profile"}
                </Text>
                <Feather name="edit-3" size={12} color="#10b981" />
              </TouchableOpacity>
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
                      onPress={() => router.push("/userProfile/appliedJobs")}
                      activeOpacity={0.8}
                    >
                      <Feather name="send" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1">Applications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-green-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#22c55e",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/userProfile/interviews")}
                      activeOpacity={0.8}
                    >
                      <Feather name="calendar" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1">Interviews</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-cyan-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#06b6d4",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/userProfile/manageDocs")}
                      activeOpacity={0.8}
                    >
                      <Feather name="file" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center" numberOfLines={2}>
                        Upload Documents
                      </Text>
                    </TouchableOpacity>
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
                      onPress={() => router.push("/userProfile/editProfile/projects")}
                      activeOpacity={0.8}
                    >
                      <Feather name="folder" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center">Projects</Text>
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
                      onPress={() => router.push("/userProfile/editProfile/education")}
                      activeOpacity={0.8}
                    >
                      <Feather name="book" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center">Education</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-blue-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#3b82f6",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/userProfile/editProfile/skills")}
                      activeOpacity={0.8}
                    >
                      <Feather name="zap" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center">Skills</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 bg-orange-500 rounded-lg px-3 py-3 items-center justify-center"
                      style={{
                        shadowColor: "#f97316",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => router.push("/userProfile/editProfile/experiences")}
                      activeOpacity={0.8}
                    >
                      <Feather name="briefcase" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-xs mt-1 text-center">Work</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {user?.summary && (
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
                    <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center">
                      <Feather name="file-text" size={16} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-md text-gray-900">Professional Summary</Text>
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="sparkles" size={14} color="#fbbf24" />
                        <Text className="font-quicksand-medium text-sm text-emerald-600">
                          AI-powered writing available
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="font-quicksand-medium text-gray-700 mb-4 leading-6">
                    Highlight yourself with a compelling summary.
                  </Text>

                  <TouchableOpacity
                    className="bg-emerald-500 rounded-xl px-4 py-3 flex-row items-center justify-center gap-2"
                    style={{
                      shadowColor: "#10b981",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    activeOpacity={0.8}
                    onPress={() => router.push("/userProfile/editProfile/summary")}
                  >
                    <Ionicons name="sparkles" size={16} color="#fbbf24" />
                    <Text className="font-quicksand-bold text-white text-base">Add Summary</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {!user?.videoIntroUrl && (
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
                    <View className="w-8 h-8 bg-emerald-100 rounded-xl items-center justify-center">
                      <Feather name="video" size={16} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-md text-gray-900">Video Introduction</Text>
                      <View className="flex-row items-center gap-2">
                        <Feather name="star" size={14} color="#f59e0b" />
                        <Text className="font-quicksand-medium text-sm text-emerald-600">Stand out with video</Text>
                      </View>
                    </View>
                  </View>

                  <Text className="font-quicksand-medium text-gray-700 mb-3 leading-6">
                    Make a 60-second video introduction.
                  </Text>

                  <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                    <View className="flex-row items-center gap-2">
                      <View className="w-5 h-5 bg-blue-100 rounded-full items-center justify-center">
                        <Feather name="trending-up" size={12} color="#3b82f6" />
                      </View>
                      <Text className="font-quicksand-bold text-blue-800 text-sm">
                        3x More Likely to Get Interviews
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-emerald-500 rounded-xl px-4 py-3 flex-row items-center justify-center gap-2"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    activeOpacity={0.9}
                    onPress={() => router.push("/userProfile/editProfile/video-intro")}
                  >
                    <View className="flex-row items-center gap-3">
                      <Feather name="video" size={18} color="white" />
                      <Text className="font-quicksand-bold text-white text-base">Add Video Intro</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View
              className="bg-white mx-3 mb-4 rounded-2xl p-6 border border-gray-100"
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
                  <MaterialIcons name="pie-chart" size={16} color="#10b981" />
                </View>
                <Text className="font-quicksand-bold text-md text-gray-900">Applications Overview</Text>
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
              <View className="mx-3 mb-4">
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
                className="bg-white mx-3 mb-4 rounded-2xl p-6 border border-gray-100"
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
            {profileSummary.favoriteCompanies.length > 0 && (
              <View
                className="bg-white mx-3 mb-4 rounded-2xl p-6 border border-gray-100"
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
                    <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                      <Feather name="heart" size={16} color="#ef4444" />
                    </View>
                    <Text className="font-quicksand-bold text-MD text-gray-900">Favorite Companies</Text>
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
            )}
          </>
        )}
        {!isLoading && !profileSummary && <></>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
