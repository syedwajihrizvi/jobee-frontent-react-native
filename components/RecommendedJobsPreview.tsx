import { quickApplyBatch } from "@/lib/jobEndpoints";
import useAuthStore from "@/store/auth.store";
import { Application, Job, User } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const RecommendedJobsPreview = ({
  recommendedJobs,
  isLoadingRecommended,
  isViewingRecommended,
  handleViewAll,
  handleBatchQuickApplySuccess,
}: {
  handleViewAll: () => void;
  recommendedJobs?: Job[];
  isLoadingRecommended: boolean;
  isViewingRecommended?: boolean;
  handleBatchQuickApplySuccess: (jobs: Application[]) => void;
}) => {
  const { user: authUser } = useAuthStore();
  const user = authUser as User | null;
  const isAuthenticated = authUser != null;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedToRecommended, setAppliedToRecommended] = useState(false);
  const height = useSharedValue(0);

  const toggleDropdown = () => {
    setOpen(!open);
    height.value = withTiming(open ? 0 : 200, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: "hidden",
  }));

  const handleQuickApplyToAll = async () => {
    setIsSubmitting(true);
    const jobIds = recommendedJobs?.map((job) => job.id) || [];
    if (jobIds.length === 0) {
      setIsSubmitting(false);
      return;
    }
    if (user?.primaryResume == null) {
      Alert.alert("No Resume Found", "Please upload a resume to unlock quick apply.", [
        {
          text: "OK",
          onPress: () => {
            setIsSubmitting(false);
            router.push("/profile/uploadNewDoc");
          },
        },
        { text: "Cancel", style: "cancel", onPress: () => setIsSubmitting(false) },
      ]);
      return;
    }
    Alert.alert("Are your sure?", `You are about to quick apply to ${jobIds.length} jobs.`, [
      { text: "Cancel", style: "cancel", onPress: () => setIsSubmitting(false) },
      {
        text: "Apply",
        onPress: async () => {
          const res = await quickApplyBatch(jobIds);
          console.log(`RESULT OF QUICK APPLY: ${res}`);
          queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
          queryClient.invalidateQueries({ queryKey: ["jobs", "appliedJobs"] });
          setAppliedToRecommended(true);
          handleBatchQuickApplySuccess(res || []);
        },
      },
    ]);
  };

  return (
    <View
      className="bg-white rounded-2xl border border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-start justify-between p-3 border-b border-gray-100"
        onPress={toggleDropdown}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Feather name="star" size={12} color="#10b981" />
          </View>
          <Text className="font-quicksand-bold text-sm text-gray-900">
            Jobs Recommended for You ({recommendedJobs ? recommendedJobs.length : 0})
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {!open && recommendedJobs && recommendedJobs.length > 0 && (
            <View className="bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              <Text className="font-quicksand-bold text-xs text-emerald-700">
                {Math.min(recommendedJobs.length, 3)} new
              </Text>
            </View>
          )}
          <View
            className={`w-6 h-6 rounded-full items-center justify-center transition-all duration-300 ${
              open ? "bg-emerald-100" : "bg-gray-100"
            }`}
          >
            <Feather name={open ? "chevron-up" : "chevron-down"} size={12} color={open ? "#10b981" : "#6b7280"} />
          </View>
        </View>
      </TouchableOpacity>

      <Animated.View style={animatedStyle} className="overflow-hidden">
        <View className="px-5 py-5">
          {isLoadingRecommended ? (
            <View className="items-center py-8">
              <View
                className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mb-3"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <ActivityIndicator size="small" color="#10b981" />
              </View>
              <Text className="font-quicksand-medium text-gray-600">Finding your perfect matches...</Text>
            </View>
          ) : recommendedJobs && recommendedJobs?.length > 0 ? (
            <FlatList
              data={recommendedJobs?.slice(0, Math.min(recommendedJobs.length, 3))}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <Pressable
                  key={index}
                  onPress={() => router.push(`/jobs/${item.id}`)}
                  className="bg-gray-50 border border-gray-200 rounded-xl py-4 px-2"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                  android_ripple={{ color: "#f3f4f6" }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-quicksand-bold text-base text-gray-900 mb-1" numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View className="bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full">
                          <Text className="font-quicksand-bold text-xs text-emerald-700">{85 + index * 3}% match</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center gap-1">
                          <FontAwesome5 name="building" size={12} color="#6b7280" />
                          <Text className="font-quicksand-medium text-sm text-gray-600">{item.businessName}</Text>
                        </View>
                        <View className="w-1 h-1 bg-gray-400 rounded-full" />
                        <View className="flex-row items-center gap-1">
                          <Feather name="map-pin" size={12} color="#6b7280" />
                          <Text className="font-quicksand-medium text-sm text-gray-600">{item.location}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between mt-1 w-full">
                        <Text className="font-quicksand-semibold text-sm text-emerald-600">
                          ${item.minSalary?.toLocaleString()} - ${item.maxSalary?.toLocaleString()}
                        </Text>
                        <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                          <Feather name="chevron-right" size={12} color="#10b981" />
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={() => (
                <TouchableOpacity
                  className={`rounded-xl py-2 items-center w-1/2 justify-center mb-2 ${
                    appliedToRecommended ? "bg-blue-500 border border-blue-600" : "bg-green-500 border border-green-600"
                  }`}
                  style={{
                    shadowColor: appliedToRecommended ? "#ef4444" : "#10b981",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={handleQuickApplyToAll}
                  disabled={appliedToRecommended}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="zap" size={12} color="white" />
                    <Text className="font-quicksand-bold text-white text-sm">
                      {appliedToRecommended ? "Already Quick Applied" : "Quick Apply to All"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={() => (
                <TouchableOpacity
                  className={`rounded-xl py-3 items-center justify-center mt-2 ${
                    isViewingRecommended
                      ? "bg-red-500 border border-red-600"
                      : "bg-emerald-500 border border-emerald-600"
                  }`}
                  style={{
                    shadowColor: isViewingRecommended ? "#ef4444" : "#10b981",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={handleViewAll}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name={isViewingRecommended ? "x" : "eye"} size={16} color="white" />
                    <Text className="font-quicksand-bold text-white text-base">
                      {isViewingRecommended ? "Show All Jobs" : `View All ${recommendedJobs.length} Recommendations`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          ) : (
            <ScrollView contentContainerStyle={{ alignItems: "center" }} showsVerticalScrollIndicator={false}>
              <View
                className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="upload" size={24} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-bold text-gray-800 text-center mb-2">
                Get Personalized Recommendations
              </Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 text-center leading-5 px-4">
                Upload your resume to receive AI-powered job recommendations tailored to your skills and experience.
              </Text>
              <TouchableOpacity
                className="bg-blue-500 rounded-xl px-6 py-3 mt-4"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => router.push("/profile/manageDocs")}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="upload" size={16} color="white" />
                  <Text className="font-quicksand-bold text-white text-sm">Upload Resume</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default RecommendedJobsPreview;
