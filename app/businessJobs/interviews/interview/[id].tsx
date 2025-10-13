import BackBar from "@/components/BackBar";
import CheckList from "@/components/CheckList";
import InterviewersFlatList from "@/components/InterviewersFlatList";
import { images } from "@/constants";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { convertTo12Hour, getInterviewStyle } from "@/lib/utils";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewDetailsForBusiness = () => {
  const { id } = useLocalSearchParams();
  const { data: interviewDetails, isLoading } = useInterviewDetails(Number(id));
  const totalInterviewers = [...(interviewDetails?.interviewers ?? []), ...(interviewDetails?.otherInterviewers ?? [])]
    .length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interview Details" />
      <ScrollView className="p-2" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="green" />
            <Text className="font-quicksand-semibold text-lg">Fetching Interview Details</Text>
          </View>
        ) : (
          <View
            className="bg-white mt-4 rounded-2xl p-4 border border-gray-100 gap-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className={`w-3 h-3 rounded-full bg-emerald-300`} />
                <Text className="font-quicksand-semibold text-base text-gray-700">Upcoming</Text>
              </View>
              <View className="bg-emerald-100 px-3 py-1 rounded-full">
                <Text className="font-quicksand-bold text-xs text-emerald-700">{interviewDetails?.interviewDate}</Text>
              </View>
            </View>
            <View>
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl py-4 px-5 flex-row items-center justify-between"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() =>
                  router.push(
                    `/businessJobs/interviews/interview/interviewDecision/${id}?candidateName=${interviewDetails?.candidateName}&candidateProfileImage=${interviewDetails?.candidateProfileImageUrl}&jobTitle=${interviewDetails?.jobTitle}&candidateId=${interviewDetails?.candidateId}&applicantId=${interviewDetails?.applicationId}&jobId=${interviewDetails?.jobId}`
                  )
                }
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <Feather name="check-circle" size={16} color="white" />
                  <Text className="font-quicksand-semibold text-white text-base">Click to make decision</Text>
                </View>
                <Feather name="arrow-right" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View>
              <Text className="font-quicksand-bold text-2xl text-gray-900 mb-2">{interviewDetails?.jobTitle}</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <Text className="font-quicksand-bold text-lg text-gray-800 mb-2">{interviewDetails?.title}</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600 leading-6">
                  {interviewDetails?.description}
                </Text>
              </View>
            </View>
            <View
              className="bg-white mt-4 rounded-2xl p-5 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-4">
                <View
                  className="w-12 h-12 rounded-full overflow-hidden border-3 border-white"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Image
                    source={{
                      uri: interviewDetails?.candidateProfileImageUrl
                        ? getS3ProfileImage(interviewDetails.candidateProfileImageUrl)
                        : images.companyLogo,
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-xl text-gray-900">
                    {interviewDetails?.candidateName || "Candidate Name"}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Feather name="briefcase" size={12} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">Job Applicant</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl px-4 py-3 items-center justify-center min-w-[90px] mt-2"
                style={{
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() =>
                  router.push(
                    `/businessJobs/applications/applicant/${interviewDetails?.candidateId}?jobId=${interviewDetails?.jobId}&candidateId=${interviewDetails?.candidateId}`
                  )
                }
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="eye" size={14} color="white" />
                  <Text className="font-quicksand-bold text-white text-sm">View</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Feather name="clock" size={16} color="#6b7280" />
                <Text className="font-quicksand-medium text-base text-gray-700">
                  {convertTo12Hour(interviewDetails?.startTime!)} - {convertTo12Hour(interviewDetails?.endTime!)} (
                  {interviewDetails?.timezone})
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Feather
                  name={
                    interviewDetails?.interviewType === "ONLINE"
                      ? "video"
                      : interviewDetails?.interviewType === "PHONE"
                        ? "phone"
                        : "users"
                  }
                  size={16}
                  color="#6b7280"
                />
                <Text className="font-quicksand-medium text-base text-gray-700">
                  {getInterviewStyle(interviewDetails?.interviewType!)}
                </Text>
              </View>

              <TouchableOpacity className="flex-row items-center justify-center gap-3 bg-blue-50 p-3 rounded-xl">
                {interviewDetails?.interviewType === "ONLINE" && (
                  <>
                    <Feather name="external-link" size={16} color="#3b82f6" />
                    <Text className="font-quicksand-semibold text-base text-blue-600">Join Meeting</Text>
                  </>
                )}
                {interviewDetails?.interviewType === "IN_PERSON" && (
                  <>
                    <Feather name="map-pin" size={16} color="#3b82f6" />
                    <Text className="font-quicksand-semibold text-base text-blue-600">View Location</Text>
                  </>
                )}
                {interviewDetails?.interviewType === "PHONE" && (
                  <>
                    <Feather name="phone" size={16} color="#3b82f6" />
                    <Text className="font-quicksand-semibold text-base text-blue-600">Call Candidate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <View
              className="bg-white mt-4 mb-6 rounded-2xl p-6 border border-gray-100"
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
                  <Feather name="users" size={20} color="#22c55e" />
                </View>
                <View>
                  <Text className="font-quicksand-bold text-xl text-gray-900">Interviewers</Text>
                  <Text className="font-quicksand text0sm text-gray-600">
                    {totalInterviewers} {totalInterviewers === 1 ? "Interviewer" : "Interviewers"}
                  </Text>
                </View>
              </View>
              <InterviewersFlatList
                interviewers={interviewDetails?.interviewers ?? []}
                otherInterviewers={interviewDetails?.otherInterviewers ?? []}
                handleInterviewerPress={() => {}}
              />
            </View>
            {interviewDetails?.preparationTipsFromInterviewer &&
              interviewDetails.preparationTipsFromInterviewer.length > 0 && (
                <View
                  className="bg-white mt-4 rounded-2xl p-6 border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                      <FontAwesome5 name="lightbulb" size={20} color="#f59e0b" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Preparation Tips for Candidate</Text>
                  </View>

                  <View className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                    <CheckList items={interviewDetails?.preparationTipsFromInterviewer || []} withBorder={false} />
                  </View>
                </View>
              )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default InterviewDetailsForBusiness;
