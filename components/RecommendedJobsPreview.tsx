import { quickApplyBatch } from "@/lib/jobEndpoints";
import { calculateRemainingTime } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Application, Job, User } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type Props = {
  handleViewAll: () => void;
  recommendedJobs?: { job: Job; match: number }[];
  isLoadingRecommended: boolean;
  isViewingRecommended?: boolean;
  handleBatchQuickApplySuccess: (jobs: Application[]) => void;
};

const RecommendedJobsPreview = ({
  recommendedJobs,
  isLoadingRecommended,
  isViewingRecommended,
  handleBatchQuickApplySuccess,
}: Props) => {
  const { user: authUser, setUser } = useAuthStore();
  const { addAppliedJobs } = useUserJobsStore();
  const user = authUser as User | null;
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedToRecommended, setAppliedToRecommended] = useState(false);
  const { applications, setApplications } = useUserStore();
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
  const height = useSharedValue(0);

  useEffect(() => {
    const updateTime = () => {
      if (!user?.canQuickApplyBatch && user?.nextQuickApplyBatchTime) {
        const remainingTime = calculateRemainingTime(user?.nextQuickApplyBatchTime);
        const { hours, minutes } = remainingTime;
        setTimeRemaining({ hours, minutes });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [user?.nextQuickApplyBatchTime, user?.canQuickApplyBatch]);

  const toggleDropdown = () => {
    setOpen(!open);
    height.value = withTiming(open ? 0 : 200, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: "hidden",
  }));

  const handleQuickApplyToAll = async () => {
    if (!user?.canQuickApplyBatch) {
      Alert.alert(
        "Quick Apply Cooldown",
        "You can only quick apply once every 6 hours. This helps us provide you with fresh, relevant recommendations.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    const jobIds = recommendedJobs?.map((job) => job.job.id) || [];
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
            router.push("/userProfile/uploadNewDoc");
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
          try {
            const res = await quickApplyBatch(jobIds);
            if (res) {
              setAppliedToRecommended(true);
              const newApplications: Application[] = res.map((application) => {
                return {
                  id: application.id,
                  appliedAt: application.appliedAt,
                  jobId: application.job.id,
                  status: application.status,
                } as Application;
              });
              const updatedUser = {
                ...user,
                canQuickApplyBatch: false,
                nextQuickApplyBatchTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
              } as User;
              setUser(updatedUser);
              addAppliedJobs(recommendedJobs?.map((r) => r.job) || []);
              setApplications([...newApplications, ...applications]);
              handleBatchQuickApplySuccess(res || []);
              setIsSubmitting(false);
            }
          } catch (error) {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  const getButtonState = () => {
    if (isSubmitting) {
      return {
        disabled: true,
        bgColor: "bg-gray-400",
        borderColor: "border-gray-500",
        text: "Applying...",
        icon: "loader",
      };
    }

    if (!user?.canQuickApplyBatch || appliedToRecommended) {
      return {
        disabled: true,
        bgColor: "bg-blue-500",
        borderColor: "border-blue-600",
        text: "Already Quick Applied",
        icon: "check",
      };
    }

    return {
      disabled: false,
      bgColor: "bg-emerald-500",
      borderColor: "border-green-600",
      text: "Quick Apply to All",
      icon: "zap",
    };
  };

  const buttonState = getButtonState();
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
            <View
              className={`border px-3 py-1 rounded-full ${
                user?.canQuickApplyBatch ? "bg-emerald-100 border-emerald-200" : "bg-orange-100 border-orange-200"
              }`}
            >
              <Text
                className={`font-quicksand-bold text-xs ${
                  user?.canQuickApplyBatch ? "text-emerald-700" : "text-orange-700"
                }`}
              >
                {user?.canQuickApplyBatch ? (
                  `${Math.min(recommendedJobs.length, 3)} new`
                ) : (
                  <Feather name="clock" size={10} color="#d97706" />
                )}
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
          {!user?.canQuickApplyBatch && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
            >
              <View
                className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-4"
                style={{
                  shadowColor: "#f97316",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="clock" size={20} color="#f97316" />
              </View>

              <Text className="font-quicksand-bold text-lg text-gray-900 text-center">Recommended Jobs Cooldown</Text>

              <Text className="font-quicksand-medium text-sm text-gray-600 text-center leading-5 px-4 mb-6">
                We are preparing fresh, personalized recommendations for you. New batch available in{" "}
                {timeRemaining.hours} hours and {timeRemaining.minutes} minutes.
              </Text>
              <View className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center">
                    <Feather name="bell" size={12} color="#3b82f6" />
                  </View>
                  <Text className="font-quicksand-bold text-sm text-gray-900">Get Notified When Ready</Text>
                </View>

                <Text className="font-quicksand-medium text-xs text-gray-600 mb-4 leading-4">
                  We will alert you when new recommendations are available so you never miss out on great opportunities.
                </Text>

                <View className="gap-3">
                  <TouchableOpacity
                    className="bg-blue-500 border border-blue-600 rounded-xl p-3 flex-row items-center justify-center gap-2"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={() => {
                      Alert.alert(
                        "Push Notifications",
                        "Enable push notifications to get instant alerts when new job recommendations are ready.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Enable", onPress: () => console.log("Enable push notifications") },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="smartphone" size={16} color="white" />
                    <Text className="font-quicksand-semibold text-white text-sm">Enable Push Notifications</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-emerald-500 border border-emerald-600 rounded-xl p-3 flex-row items-center justify-center gap-2"
                    style={{
                      shadowColor: "#10b981",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={() => {
                      Alert.alert(
                        "Email Notifications",
                        "Get email alerts when new personalized job recommendations are available.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Subscribe", onPress: () => console.log("Enable email notifications") },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="mail" size={16} color="white" />
                    <Text className="font-quicksand-semibold text-white text-sm">Email Me Updates</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-purple-500 border border-purple-600 rounded-xl p-3 flex-row items-center justify-center gap-2"
                    style={{
                      shadowColor: "#8b5cf6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={() => {
                      Alert.alert(
                        "SMS Notifications",
                        "Receive text message alerts for new job recommendations (standard messaging rates apply).",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Enable SMS", onPress: () => console.log("Enable SMS notifications") },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="message-circle" size={16} color="white" />
                    <Text className="font-quicksand-semibold text-white text-sm">SMS Alerts</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                <View className="flex-row items-start gap-2">
                  <Feather name="info" size={14} color="#3b82f6" />
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-xs text-blue-800 mb-1">Why the wait?</Text>
                    <Text className="font-quicksand-medium text-xs text-blue-700 leading-4">
                      Our AI analyzes market trends and your profile to curate the best matches. The cooldown ensures
                      you get quality over quantity.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          {user?.canQuickApplyBatch && isLoadingRecommended && (
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
          )}
          {user?.canQuickApplyBatch && !isLoadingRecommended && recommendedJobs && recommendedJobs.length > 0 && (
            <FlatList
              data={recommendedJobs?.slice(0, Math.min(recommendedJobs.length, 3))}
              keyExtractor={(item) => item.job.id.toString()}
              renderItem={({ item, index }) => (
                <Pressable
                  key={index}
                  onPress={() => router.push(`/jobs/${item.job.id}`)}
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
                          {item.job.title}
                        </Text>
                        <View className="bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full">
                          <Text className="font-quicksand-bold text-xs text-emerald-700">{item.match}% match</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center gap-1">
                          <FontAwesome5 name="building" size={12} color="#6b7280" />
                          <Text className="font-quicksand-medium text-sm text-gray-600">{item.job.businessName}</Text>
                        </View>
                        <View className="w-1 h-1 bg-gray-400 rounded-full" />
                        <View className="flex-row items-center gap-1">
                          <Feather name="map-pin" size={12} color="#6b7280" />
                          <Text className="font-quicksand-medium text-sm text-gray-600">{item.job.location}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between mt-1 w-full">
                        <Text className="font-quicksand-semibold text-sm text-emerald-600">
                          ${item.job.minSalary?.toLocaleString()} - ${item.job.maxSalary?.toLocaleString()}
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
                  className={`rounded-xl py-3 px-4 items-center justify-center mb-3 ${buttonState.bgColor} border ${buttonState.borderColor}`}
                  style={{
                    shadowColor: buttonState.disabled ? "#6b7280" : "#22c55e",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: buttonState.disabled ? 0.1 : 0.2,
                    shadowRadius: 6,
                    elevation: buttonState.disabled ? 1 : 4,
                    opacity: buttonState.disabled ? 0.7 : 1,
                  }}
                  onPress={handleQuickApplyToAll}
                  disabled={buttonState.disabled}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name={buttonState.icon as keyof typeof Feather.glyphMap} size={14} color="white" />
                    <Text className="font-quicksand-bold text-white text-sm">{buttonState.text}</Text>
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
                  onPress={() => router.push("/userProfile/recommendedJobs")}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name={isViewingRecommended ? "x" : "eye"} size={16} color="white" />
                    <Text className="font-quicksand-bold text-white text-base">
                      {isViewingRecommended ? "Show All Jobs" : `View All ${recommendedJobs?.length} Recommendations`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          )}

          {!isLoadingRecommended && recommendedJobs?.length === 0 && user?.primaryResume == null && (
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
                Get Personalized Recommendation
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
                onPress={() => router.push("/userProfile/manageDocs")}
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
