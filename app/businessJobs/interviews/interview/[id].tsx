import BackBar from "@/components/BackBar";
import CheckList from "@/components/CheckList";
import InterviewersFlatList from "@/components/InterviewersFlatList";
import InterviewFormatSummary from "@/components/InterviewFormatSummary";
import ModalWithBg from "@/components/ModalWithBg";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import { markInterviewAsCompleted } from "@/lib/interviewEndpoints";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { convertTo12Hour } from "@/lib/utils";
import useApplicantsForJobStore from "@/store/applicants.store";
import useBusinessUserStore from "@/store/businessUser.store";
import { InterviewDetails } from "@/type";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewDetailsForBusiness = () => {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const { setApplicationStatus } = useApplicantsForJobStore();
  const { setInterviewStatus } = useBusinessUserStore();
  const { data: interviewDetails, isLoading } = useInterviewDetails(Number(id));
  const [interview, setInterview] = useState<InterviewDetails | null>(interviewDetails || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInterviewActionsModal, setInterviewActionsModal] = useState(false);
  const totalInterviewers = [...(interviewDetails?.interviewers ?? []), ...(interviewDetails?.otherInterviewers ?? [])]
    .length;

  useEffect(() => {
    if (!isLoading && interviewDetails) {
      setInterview(interviewDetails);
    }
  }, [interviewDetails, isLoading]);

  const renderDecisionButton = (result: string) => {
    if (result === "PENDING") {
      return (
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
              `/businessJobs/interviews/interview/interviewDecision/${id}?candidateName=${interview?.candidateName}&candidateProfileImage=${interview?.candidateProfileImageUrl}&jobTitle=${interview?.jobTitle}&candidateId=${interview?.candidateId}&applicantId=${interview?.applicationId}&jobId=${interview?.jobId}`
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
      );
    } else if (result === "NEXT_ROUND") {
      return (
        <View
          className="bg-blue-500 rounded-xl py-4 px-5 flex-row items-center justify-center"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center gap-3">
            <Feather name="check-circle" size={16} color="white" />
            <Text className="font-quicksand-semibold text-white text-base">Candidate Moving to Next Round</Text>
          </View>
        </View>
      );
    }
  };

  const handleMarkAsCompleted = async () => {
    setIsUpdating(true);
    setInterview({ ...interview, status: "COMPLETED" } as InterviewDetails);
    setIsUpdating(false);
    setInterviewActionsModal(false);
    try {
      const res = await markInterviewAsCompleted(Number(id));
      if (!res) {
        setInterview({ ...interview, status: "SCHEDULED" } as InterviewDetails);
      }
      const applicantId = interview?.applicationId;
      queryClient.invalidateQueries({ queryKey: ["interviewDetails", Number(id)] });
      queryClient.invalidateQueries({ queryKey: ["applicant", applicantId] });
      setApplicationStatus(applicantId!, "INTERVIEWED_COMPLETED");
      setInterviewStatus(Number(id), "COMPLETED");
    } catch (error) {
      console.log("Error marking interview as completed: ", error);
      setInterview({ ...interview, status: "SCHEDULED" } as InterviewDetails);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interview Details" />
      <ScrollView className="p-2" showsVerticalScrollIndicator={false}>
        {isLoading || !interview ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="green" />
            <Text className="font-quicksand-semibold text-lg">Fetching Interview Details</Text>
          </View>
        ) : (
          <View
            className="bg-white mt-4 rounded-2xl p-4 border border-gray-100 gap-2"
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
                <Text className="font-quicksand-semibold text-base text-gray-700">
                  {interview?.status === "SCHEDULED" ? "Upcoming" : "Completed"}
                </Text>
              </View>
            </View>
            {interview?.status === "SCHEDULED" && (
              <TouchableOpacity
                className="bg-emerald-500 rounded-xl py-4 px-5 flex-row items-center justify-between"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => setInterviewActionsModal(true)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="options" size={16} color="white" />
                  <Text className="font-quicksand-semibold text-white text-base">Interview Actions</Text>
                </View>
                <Feather name="arrow-right" size={16} color="white" />
              </TouchableOpacity>
            )}
            {interview?.status === "COMPLETED" && <View>{renderDecisionButton(interview?.decisionResult!)}</View>}
            <View>
              <Text className="font-quicksand-bold text-lg text-gray-900 mb-2">{interview?.jobTitle}</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <Text className="font-quicksand-bold text-lg text-gray-800">{interview?.title}</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600 leading-6">{interview?.description}</Text>
              </View>
            </View>
            <View
              className="bg-white mt-4 rounded-2xl p-4 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-2">
                <RenderUserProfileImage
                  profileImageUrl={interview?.candidateProfileImageUrl}
                  profileImageSize={12}
                  fullName={interview?.candidateName || "Candidate"}
                />
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-lg text-gray-900">
                    {interview?.candidateName || "Candidate Name"}
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
                    `/businessJobs/applications/applicant/${interview?.applicationId}?jobId=${interview?.jobId}&candidateId=${interview?.candidateId}`
                  )
                }
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="eye" size={14} color="white" />
                  <Text className="font-quicksand-bold text-white text-sm">View Candidate</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Feather name="calendar" size={16} color="#10b981" />
                <Text className="font-quicksand-semibold text-base">{interview?.interviewDate}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Feather name="clock" size={16} color="#10b981" />
                <Text className="font-quicksand-semibold">
                  {convertTo12Hour(interview?.startTime!)} - {convertTo12Hour(interview?.endTime!)} (
                  {interview?.timezone})
                </Text>
              </View>
            </View>
            <InterviewFormatSummary interviewDetails={interview || null} />
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
                <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="users" size={12} color="#22c55e" />
                </View>
                <View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Interviewers</Text>
                  <Text className="font-quicksand text0sm text-gray-600">
                    {totalInterviewers} {totalInterviewers === 1 ? "Interviewer" : "Interviewers"}
                  </Text>
                </View>
              </View>
              <InterviewersFlatList
                interviewers={interview?.interviewers ?? []}
                otherInterviewers={interview?.otherInterviewers ?? []}
                onInterviewerSelect={() => {}}
              />
            </View>
            {interview?.preparationTipsFromInterviewer && interview.preparationTipsFromInterviewer.length > 0 && (
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
                  <CheckList items={interview?.preparationTipsFromInterviewer || []} withBorder={false} />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <ModalWithBg visible={showInterviewActionsModal} customHeight={0.6} customWidth={0.9}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Interview Actions</Text>
            <TouchableOpacity onPress={() => setInterviewActionsModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 px-6 py-4">
            <TouchableOpacity
              className="bg-emerald-50 border border-green-200 rounded-xl p-4 mb-4 flex-row items-center gap-4"
              style={{
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={handleMarkAsCompleted}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                <Feather name="check-circle" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-base text-gray-900">Mark as Complete</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  Interview completed? Click here and then make a decision on the candidate.
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center gap-4"
              style={{
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => {
                console.log("Cancel Interview");
              }}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                <Feather name="x" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-base text-gray-900">Cancel Interview</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  Cancel this interview and notify the candidate about the cancellation.
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex-row items-center gap-4"
              style={{
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => {
                console.log("Update Interview");
              }}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="calendar" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-bold text-base text-gray-900">Update Interview</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  Change of plans? Update the interview details.
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ModalWithBg>
    </SafeAreaView>
  );
};
export default InterviewDetailsForBusiness;
