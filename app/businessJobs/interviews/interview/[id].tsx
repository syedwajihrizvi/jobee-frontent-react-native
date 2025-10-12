import BackBar from "@/components/BackBar";
import { images } from "@/constants";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewDetailsForBusiness = () => {
  const { id } = useLocalSearchParams();
  const { data: intervieDetails, isLoading } = useInterviewDetails(Number(id));
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
          <>
            <View
              className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100 gap-4"
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
                <View className="bg-indigo-100 px-3 py-1 rounded-full">
                  <Text className="font-quicksand-bold text-xs text-indigo-700">{intervieDetails?.interviewDate}</Text>
                </View>
              </View>
              <View>
                <Text className="font-quicksand-bold text-2xl text-gray-900 mb-2">{intervieDetails?.jobTitle}</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <Text className="font-quicksand-bold text-lg text-gray-800 mb-2">{intervieDetails?.title}</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600 leading-6">
                    {intervieDetails?.description}
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
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
                    <Feather name="user" size={16} color="#6366f1" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Candidate Information</Text>
                </View>

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
                        uri: intervieDetails?.candidateProfileImageUrl
                          ? getS3ProfileImage(intervieDetails.candidateProfileImageUrl)
                          : images.companyLogo,
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-xl text-gray-900">
                      {intervieDetails?.candidateName || "Candidate Name"}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Feather name="briefcase" size={12} color="#6b7280" />
                      <Text className="font-quicksand-medium text-sm text-gray-600">Job Applicant</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-indigo-500 rounded-xl px-4 py-3 items-center justify-center min-w-[90px] mt-2"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() =>
                    router.push(
                      `/businessJobs/applications/applicant/${intervieDetails?.candidateId}?jobId=${intervieDetails?.jobId}&candidateId=${intervieDetails?.candidateId}`
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
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InterviewDetailsForBusiness;
