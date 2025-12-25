import BackBar from "@/components/BackBar";
import RejectCandidateModal from "@/components/RejectCandidateModal";
import { images } from "@/constants";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewDecision = () => {
  const { id, candidateName, candidateId, candidateProfileImage, jobId, applicantId, applicantEmail } =
    useLocalSearchParams();
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interview Decision" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View
          className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1">
              <Text className="font-quicksand-bold text-xl text-gray-900">Make Your Decision</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600">
                Choose the next step for this candidate
              </Text>
            </View>
          </View>
          <View className="flex-row items-start gap-2">
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
                  uri: candidateProfileImage ? getS3ProfileImage(candidateProfileImage as string) : images.companyLogo,
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-xl text-gray-900">{candidateName || "Candidate Name"}</Text>
              <View className="flex-row items-center gap-1">
                <Feather name="briefcase" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Job Applicant</Text>
              </View>
            </View>
            <TouchableOpacity
              className=" bg-emerald-500 rounded-xl flex-row justify-center items-center gap-1 p-2"
              onPress={() =>
                router.push(
                  `/businessJobs/applications/applicant/${applicantId}?jobId=${jobId}&candidateId=${candidateId}`
                )
              }
            >
              <Text className="font-quicksand-medium text-sm text-white">View Profile</Text>
              <Feather name="arrow-right" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-4 mt-6 gap-4">
          <TouchableOpacity
            className="bg-white rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View className="flex-row items-start gap-4">
              <View
                className="w-16 h-16 bg-emerald-500 rounded-2xl items-center justify-center"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Feather name="check-circle" size={24} color="white" />
              </View>

              <View className="flex-1">
                <Text className="font-quicksand-bold text-xl text-gray-900 mb-1">Make Job Offer</Text>
                <Text className="font-quicksand-medium text-base text-gray-600 leading-6">
                  Send an official job offer with salary, benefits, and start date details.
                </Text>
              </View>

              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                <Feather name="arrow-right" size={18} color="#10b981" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
            onPress={() =>
              router.push(
                `/businessJobs/applications/applicant/scheduleInterview?applicantId=${applicantId}&jobId=${jobId}&candidateId=${candidateId}&previousInterviewId=${id}&applicantEmail=${applicantEmail}`
              )
            }
            activeOpacity={0.8}
          >
            <View className="flex-row items-start gap-4">
              <View
                className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Feather name="refresh-cw" size={24} color="white" />
              </View>

              <View className="flex-1">
                <Text className="font-quicksand-bold text-xl text-gray-900 mb-1">Schedule Next Round</Text>
                <Text className="font-quicksand-medium text-base text-gray-600 leading-6">
                  Arrange another interview round with different team members or stakeholders.
                </Text>
              </View>

              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="arrow-right" size={18} color="#3b82f6" />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
            onPress={() => setShowRejectModal(true)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-start gap-4">
              <View
                className="w-16 h-16 bg-red-500 rounded-2xl items-center justify-center"
                style={{
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Feather name="x-circle" size={24} color="white" />
              </View>

              <View className="flex-1">
                <Text className="font-quicksand-bold text-xl text-gray-900 mb-1">Reject Candidate</Text>
                <Text className="font-quicksand-medium text-base text-gray-600 leading-6">
                  Send a polite rejection notice and provide feedback if desired.
                </Text>
              </View>

              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                <Feather name="arrow-right" size={18} color="#ef4444" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-1" />
      </ScrollView>
      <RejectCandidateModal
        candidateName={candidateName as string}
        applicantId={Number(applicantId)}
        jobId={Number(jobId)}
        interviewId={Number(id)}
        visible={showRejectModal}
        handleClose={() => {
          setShowRejectModal(false);
          router.replace(`/businessJobs/applications/applicant/${applicantId}`);
        }}
      />
    </SafeAreaView>
  );
};

export default InterviewDecision;
