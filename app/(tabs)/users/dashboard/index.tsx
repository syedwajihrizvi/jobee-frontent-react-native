import Piechart from "@/components/Piechart";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { useProfileCompleteness } from "@/lib/services/useProfileCompleteness";
import { useTopCompanies } from "@/lib/services/useTopCompanies";
import { toggleFavoriteCompany } from "@/lib/updateUserProfile";
import { formatDate, getApplicationStatus } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const { isLoading, profileSummary } = useProfileSummaryStore();
  const { user: userProfile } = useAuthStore();
  const { isLoading: isLoadingProfileCompleteness, data: completeness } = useProfileCompleteness();
  const { data: topCompanies, isLoading: isLoadingTopCompanies } = useTopCompanies();

  console.log(profileSummary?.lastApplication);
  const handleFavoriteCompany = async (companyId: number) => {
    try {
      const result = await toggleFavoriteCompany(Number(companyId));
      if (result) {
        const currFavorites = profileSummary?.favoriteCompanies || [];
        const index = currFavorites.findIndex((c) => c.id === Number(companyId));
        if (index > -1) {
          const newFavorites = currFavorites.filter((c) => c.id !== Number(companyId));
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: newFavorites,
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite company:", error);
    }
  };
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
              <View className="flex-row items-center gap-3 mb-4">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-start">
                  {userProfile?.profileImageUrl ? (
                    <Image
                      source={{ uri: getS3ProfileImage(userProfile.profileImageUrl) }}
                      className="size-10 rounded-full"
                      resizeMode="contain"
                    />
                  ) : (
                    <Feather name="user" size={20} color="black" />
                  )}
                </View>
                <View>
                  <Text className="font-quicksand-bold text-lg">{profileSummary.fullName}</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">{userProfile?.title}</Text>
                </View>
              </View>
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                      <Feather name="eye" size={16} color="#3b82f6" />
                    </View>
                    <View>
                      <Text className="font-quicksand-bold text-lg text-blue-900">
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
                          <Feather name="check-circle" size={16} color="green" />
                          <Text className="font-quicksand-medium text-sm text-gray-600">Good Job!</Text>
                        </View>
                      ) : (
                        <Text className="font-quicksand-medium text-sm text-gray-600">Complete your profile</Text>
                      )}
                      <Text className="font-quicksand-bold text-sm text-blue-600">{completeness?.completeness}%</Text>
                    </View>
                    <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${completeness?.completeness!}%` }}
                      />
                    </View>
                  </>
                )}
              </View>
              <TouchableOpacity
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex-row items-center justify-center gap-2"
                onPress={() => router.push("/userProfile/editProfile")}
                activeOpacity={0.7}
              >
                <Text className="font-quicksand-semibold text-blue-700">
                  {completeness?.completeness === 100 ? "View Profile" : "Complete Profile"}
                </Text>
                <Feather name="edit-3" size={14} color="#3b82f6" />
              </TouchableOpacity>
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
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                  <MaterialIcons name="pie-chart" size={20} color="#10b981" />
                </View>
                <Text className="font-quicksand-bold text-lg text-gray-900">Applications Overview</Text>
              </View>
              <Piechart
                data={[
                  { label: "Pending", value: profileSummary.totalInConsideration, color: "#3b82f6" },
                  { label: "Rejected", value: profileSummary.totalRejections, color: "#ef4444" },
                  { label: "In Consideration", value: profileSummary.totalInterviews, color: "#10b981" },
                ]}
              />

              <TouchableOpacity
                className="bg-emerald-50 border border-green-200 rounded-xl p-3 mt-4 items-center"
                onPress={() => router.push("/userProfile/appliedJobs")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="eye" size={14} color="#10b981" />
                  <Text className="font-quicksand-semibold text-green-700">
                    View All Applications ({profileSummary.totalApplications})
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4 items-center"
                onPress={() => router.push("/users/jobs")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="briefcase" size={14} color="blue" />
                  <Text className="font-quicksand-semibold text-blue-700">Find Jobs</Text>
                </View>
              </TouchableOpacity>
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
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                  <Feather name="clock" size={20} color="#8b5cf6" />
                </View>
                <Text className="font-quicksand-bold text-lg text-gray-900">Last Application</Text>
              </View>
              {profileSummary.lastApplication && (
                <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row gap-1 items-center">
                      <RenderCompanyLogo logoUrl={profileSummary.lastApplication.companyLogoUrl} />
                      <Text className="font-quicksand-bold text-md text-purple-700">
                        {profileSummary.lastApplication.companyName}
                      </Text>
                    </View>

                    <Text className="font-quicksand-semibold text-sm px-2 border border-purple-300 rounded-full text-purple-800">
                      {getApplicationStatus(profileSummary.lastApplication.status)}
                    </Text>
                  </View>
                  <Text className="font-quicksand-medium text-md text-purple-700">
                    {profileSummary.lastApplication.jobTitle}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-quicksand-bold text-sm text-purple-900">
                      Applied on {formatDate(profileSummary.lastApplication.appliedAt)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push(`/jobs/${profileSummary.lastApplication?.jobId}`)}
                      activeOpacity={0.7}
                    >
                      <Feather name="chevron-right" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
                      <TouchableOpacity onPress={() => handleFavoriteCompany(company.id)}>
                        <AntDesign name="heart" size={14} color="#ef4444" solid />
                      </TouchableOpacity>
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
