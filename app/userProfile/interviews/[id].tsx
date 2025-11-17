import BackBar from "@/components/BackBar";
import CheckList from "@/components/CheckList";
import CompanyInformation from "@/components/CompanyInformation";
import InterviewersFlatList from "@/components/InterviewersFlatList";
import InterviewFormatSummary from "@/components/InterviewFormatSummary";
import PrepareWithJobee from "@/components/PrepareWithJobee";
import ViewInterviewerModal from "@/components/ViewInterviewerModal";
import { getInterviewerProfileSummary, prepareForInterview } from "@/lib/interviewEndpoints";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { convertTo12Hour } from "@/lib/utils";
import { InterviewerProfileSummary } from "@/type";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewDetails = () => {
  const { id: interviewId } = useLocalSearchParams();
  const [showInterviewPrepModal, setShowInterviewPrepModal] = useState(false);
  const [interviewModalVisible, setInterviewModalVisible] = useState(false);
  const [loadingInterviewer, setLoadingInterviewer] = useState(false);
  const [isSendingInterviewPrepRequest, setIsSendingInterviewPrepRequest] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<InterviewerProfileSummary | null>(null);
  const { data: interviewDetails, isLoading } = useInterviewDetails(Number(interviewId));

  const handlePrepareWithJobee = () => {
    if (interviewDetails?.preparationStatus === "NOT_STARTED") {
      setShowInterviewPrepModal(true);
    } else if (interviewDetails?.preparationStatus === "IN_PROGRESS") {
      router.push(`/userProfile/interviews/prep?id=${interviewId}`);
    } else {
      router.push(`/userProfile/interviews/prep?id=${interviewId}`);
    }
  };

  const renderInterviewPrepText = () => {
    if (interviewDetails?.preparationStatus === "NOT_STARTED") {
      return "Prepare with Jobee";
    } else if (interviewDetails?.preparationStatus === "IN_PROGRESS") {
      return "Get Ready";
    } else {
      return "Review Prep";
    }
  };

  const handleShowInterviewPrepModalClose = () => {
    setShowInterviewPrepModal(false);
  };

  const handlePrepareWithJobeeConfirm = async () => {
    setIsSendingInterviewPrepRequest(true);
    try {
      await prepareForInterview(Number(interviewId));
      Alert.alert("Success", "You are all set! We will notify you once your prep ready!");
      handleShowInterviewPrepModalClose();
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setIsSendingInterviewPrepRequest(false);
    }
  };

  const interviewers = [...(interviewDetails?.interviewers || []), ...(interviewDetails?.otherInterviewers || [])];
  const totalInterviewers = interviewers.length;

  const handleInterviewerPress = async (
    email: string,
    firstName: string,
    lastName: string,
    profileImageUrl: string
  ) => {
    setInterviewModalVisible(true);
    setLoadingInterviewer(true);
    try {
      const details = await getInterviewerProfileSummary(email);
      if (details) {
        setInterviewerDetails({ ...details, verified: true });
      } else {
        setInterviewerDetails({
          firstName,
          lastName,
          email,
          title: "",
          summary: "",
          id: 0,
          verified: false,
          profileImageUrl,
        });
      }
      return;
    } catch (error) {
      console.error("Error fetching interviewer details:", error);
      return;
    } finally {
      setLoadingInterviewer(false);
    }
  };

  const renderInterviewDecision = () => {
    if (interviewDetails?.decisionResult === "PENDING") {
      return (
        <View
          className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-blue-100"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
              <Feather name="clock" size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-blue-600 text-xl">Interview Completed</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600">Awaiting hiring team decision</Text>
            </View>
          </View>
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <Text className="font-quicksand-bold text-blue-800 text-base text-center leading-6">
              Thank you for completing your interview! Our hiring team is reviewing all candidates and will notify you
              of their decision soon.
            </Text>
          </View>
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Feather name="info" size={16} color="#6b7280" />
              <Text className="font-quicksand-bold text-base text-gray-900">What happens next?</Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-start gap-3">
                <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <Text className="font-quicksand-medium text-gray-700 text-sm leading-5 flex-1">
                  Our team will review your interview performance
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <Text className="font-quicksand-medium text-gray-700 text-sm leading-5 flex-1">
                  You&apos;ll receive an email notification with our decision
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <Text className="font-quicksand-medium text-gray-700 text-sm leading-5 flex-1">
                  If selected, we&apos;ll discuss next steps and potential start dates
                </Text>
              </View>
            </View>
          </View>
          <View className="bg-emerald-50 border border-green-200 rounded-xl p-4">
            <View className="flex-row items-start gap-2">
              <Feather name="thumbs-up" size={16} color="#16a34a" />
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-green-800 text-sm mb-1">Great Job!</Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                  You&apos;ve taken an important step in your career journey. Stay positive and continue pursuing your
                  goals!
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else if (interviewDetails?.decisionResult === "REJECTED") {
      return (
        <View
          className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-red-100"
          style={{
            shadowColor: "#ef4444",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3 mb-2">
            <View className="flex-1">
              <Text className="font-quicksand-bold text-red-600 text-xl">Interview Decision</Text>
            </View>
          </View>
          <View className="bg-red-50 border border-red-200 rounded-xl p-2 mb-2">
            <Text className="font-quicksand-bold text-red-800 text-sm text-center leading-6">
              We appreciate your time and interest in this position. After careful consideration, we have decided to
              move forward with another candidate.
            </Text>
          </View>
          {interviewDetails.rejectionReason && (
            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="info" size={16} color="#6b7280" />
                <Text className="font-quicksand-bold text-base text-gray-900">Reason for Decision</Text>
              </View>
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <Text className="font-quicksand-medium text-gray-700 text-sm leading-5">
                  {interviewDetails.rejectionReason}
                </Text>
              </View>
            </View>
          )}
          {interviewDetails.rejectionFeedback && (
            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="message-square" size={16} color="#6b7280" />
                <Text className="font-quicksand-bold text-base text-gray-900">Additional Feedback</Text>
              </View>
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Text className="font-quicksand-medium text-blue-800 text-sm leading-5">
                  {interviewDetails.rejectionFeedback}
                </Text>
              </View>
            </View>
          )}
          <View className="bg-emerald-50 border border-green-200 rounded-xl p-4">
            <View className="flex-row items-start gap-2">
              <Feather name="heart" size={16} color="#16a34a" />
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-green-800 text-sm mb-1">Keep Going!</Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                  This decision doesn nt define your abilities. Keep applying and stay confident in your journey!
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interview Details" />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text className="font-quicksand-semibold text-lg text-gray-700">Loading interview details...</Text>
        </View>
      ) : (
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
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <CompanyInformation
                  companyName={interviewDetails?.companyName!}
                  companyLogoUrl={interviewDetails?.companyLogoUrl!}
                />
              </View>
            </View>
            <Text className="font-quicksand-bold text-2xl text-gray-900 leading-8 mb-2">{interviewDetails?.title}</Text>

            <Text className="font-quicksand-medium text-base text-gray-600 leading-6 mb-2">
              {interviewDetails?.description}
            </Text>

            <TouchableOpacity
              className="bg-emerald-100 border border-emerald-200 px-4 py-3 rounded-xl flex-row items-center gap-2 self-start"
              style={{
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => router.push(`/jobs/${interviewDetails?.jobId}`)}
              activeOpacity={0.7}
            >
              <Feather name="external-link" size={16} color="#059669" />
              <Text className="font-quicksand-bold text-emerald-700 text-sm">View Job Posting</Text>
            </TouchableOpacity>
          </View>
          {interviewDetails?.status === "COMPLETED" && renderInterviewDecision()}
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
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="calendar" size={20} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Interview Details</Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mb-4">
              <View className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl flex-row items-center gap-2">
                <Feather name="calendar" size={14} color="#3b82f6" />
                <Text className="font-quicksand-semibold text-sm text-blue-800">{interviewDetails?.interviewDate}</Text>
              </View>

              <View className="bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl flex-row items-center gap-2">
                <Feather name="clock" size={14} color="#8b5cf6" />
                <Text className="font-quicksand-semibold text-sm text-purple-800">
                  {convertTo12Hour(interviewDetails?.startTime!)} - {convertTo12Hour(interviewDetails?.endTime!)}
                </Text>
              </View>

              <View className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex-row items-center gap-2">
                <Feather name="globe" size={14} color="#10b981" />
                <Text className="font-quicksand-semibold text-sm text-emerald-800">{interviewDetails?.timezone}</Text>
              </View>
            </View>
          </View>
          <View className="p-4">
            <InterviewFormatSummary interviewDetails={interviewDetails || null} />
          </View>
          {interviewDetails?.preparationTipsFromInterviewer &&
            interviewDetails?.preparationTipsFromInterviewer.length > 0 && (
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
                  <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                    <FontAwesome5 name="lightbulb" size={20} color="#f59e0b" />
                  </View>
                  <Text className="font-quicksand-bold text-lg text-gray-900">Preparation Tips from Inteviewers</Text>
                </View>

                <View className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                  <CheckList items={interviewDetails?.preparationTipsFromInterviewer || []} withBorder={false} />
                </View>
              </View>
            )}
          <View
            className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-6 border border-gray-100"
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
                <Feather name="users" size={20} color="#22c55e" />
              </View>
              <View>
                <Text className="font-quicksand-bold text-xl text-gray-900">Your Interviewers</Text>
                <Text className="font-quicksand text0sm text-gray-600">
                  {totalInterviewers} {totalInterviewers === 1 ? "Interviewer" : "Interviewers"}
                </Text>
              </View>
            </View>
            <InterviewersFlatList
              interviewers={interviewDetails?.interviewers ?? []}
              otherInterviewers={interviewDetails?.otherInterviewers ?? []}
              onInterviewerSelect={(email, name, profileImageUrl) => {
                handleInterviewerPress(email, name.split(" ")[0], name.split(" ")[1] || "", profileImageUrl);
              }}
            />
          </View>
          <View className="flex-1" />
        </ScrollView>
      )}
      {interviewDetails?.status === "SCHEDULED" && (
        <View
          className="bg-white border-t border-gray-200 px-4 pt-4 pb-8 absolute bottom-0 w-full"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              disabled={isSendingInterviewPrepRequest}
              onPress={handlePrepareWithJobee}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={18} color="#fbbf24" />
                <Text className="font-quicksand-bold text-white text-base">{renderInterviewPrepText()}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={16} color="#6b7280" />
                <Text className="font-quicksand-bold text-gray-700 text-base">Reschedule</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PrepareWithJobee
        visible={showInterviewPrepModal}
        handlePrepareWithJobeeConfirm={handlePrepareWithJobeeConfirm}
        company={interviewDetails?.companyName!}
        handleClose={handleShowInterviewPrepModalClose}
      />
      <ViewInterviewerModal
        visible={interviewModalVisible}
        handleClose={setInterviewModalVisible}
        loadingInterviewer={loadingInterviewer}
        interviewerDetails={interviewerDetails}
      />
    </SafeAreaView>
  );
};

export default InterviewDetails;
