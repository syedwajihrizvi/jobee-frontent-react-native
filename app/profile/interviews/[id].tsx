import BackBar from "@/components/BackBar";
import CheckList from "@/components/CheckList";
import CompanyInformation from "@/components/CompanyInformation";
import PrepareWithJobee from "@/components/PrepareWithJobee";
import ViewInterviewerModal from "@/components/ViewInterviewerModal";
import { images } from "@/constants";
import { getInterviewerProfileSummary, prepareForInterview } from "@/lib/interviewEndpoints";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { convertTo12Hour, getInterviewStyle } from "@/lib/utils";
import { InterviewerProfileSummary } from "@/type";
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
      router.push(`/profile/interviews/prep?id=${interviewId}`);
    } else {
      router.push(`/profile/interviews/prep?id=${interviewId}`);
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
      const res = await prepareForInterview(Number(interviewId));
      if (res) {
        Alert.alert("Success", "You are all set! We will notify you once we are ready. Approximately 5 minutes");
        handleShowInterviewPrepModalClose();
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setIsSendingInterviewPrepRequest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
      case "IN_PROGRESS":
        return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
      case "COMPLETED":
        return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
    }
  };

  const statusColors = getStatusColor(interviewDetails?.preparationStatus || "NOT_STARTED");

  const interviewers = [...(interviewDetails?.interviewers || []), ...(interviewDetails?.otherInterviewers || [])];
  const totalInterviewers = interviewers.length;

  const handleInterviewerPress = async (email: string, firstName: string, lastName: string) => {
    setInterviewModalVisible(true);
    setLoadingInterviewer(true);
    try {
      const details = await getInterviewerProfileSummary(email);
      if (details) {
        setInterviewerDetails({ ...details, verified: true });
      } else {
        setInterviewerDetails({ firstName, lastName, email, title: "", summary: "", id: 0, verified: false });
      }
      return;
    } catch (error) {
      console.error("Error fetching interviewer details:", error);
      return;
    } finally {
      setLoadingInterviewer(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interview Details" />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4"
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
        <ScrollView className="flex-1 mb-10" showsVerticalScrollIndicator={false}>
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
                <CompanyInformation company={interviewDetails?.companyName!} />
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

              <View className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-xl flex-row items-center gap-2">
                <Feather name="video" size={14} color="#6b7280" />
                <Text className="font-quicksand-semibold text-sm text-gray-800">
                  {getInterviewStyle(interviewDetails?.interviewType!)}
                </Text>
              </View>
            </View>
            <View className="gap-3">
              {interviewDetails?.location && (
                <View className="flex-row items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                    <MaterialIcons name="location-on" size={16} color="#ef4444" />
                  </View>
                  <Text className="font-quicksand-medium text-gray-800 flex-1">{interviewDetails?.location}</Text>
                </View>
              )}
              {interviewDetails?.phoneNumber && (
                <View className="flex-row items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                    <MaterialIcons name="phone" size={16} color="#3b82f6" />
                  </View>
                  <Text className="font-quicksand-medium text-blue-800 flex-1">{interviewDetails?.phoneNumber}</Text>
                </View>
              )}
              {interviewDetails?.meetingLink && (
                <TouchableOpacity
                  className="flex-row items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                    <AntDesign name="link" size={16} color="#6366f1" />
                  </View>
                  <Text className="font-quicksand-medium text-green-800 flex-1">Join Meeting Link</Text>
                  <Feather name="external-link" size={16} color="#6366f1" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {interviewDetails?.preparationTipsFromInterviewer &&
            interviewDetails.preparationTipsFromInterviewer.length > 0 && (
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
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Feather name="users" size={20} color="#22c55e" />
              </View>
              <View>
                <Text className="font-quicksand-bold text-xl text-gray-900">Your Interviewers</Text>
                <Text className="font-quicksand text0sm text-gray-600">
                  {totalInterviewers} {totalInterviewers === 1 ? "Interviewer" : "Interviewers"}
                </Text>
              </View>
            </View>
            <FlatList
              data={[...(interviewDetails?.interviewers ?? []), ...(interviewDetails?.otherInterviewers ?? [])]}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="items-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-[120px]"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() =>
                    handleInterviewerPress(item.email, item.name.split(" ")[0], item.name.split(" ")[1] || "")
                  }
                  activeOpacity={0.7}
                >
                  <View
                    className="w-16 h-16 rounded-full mb-3 overflow-hidden border-2 border-gray-200"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Image source={{ uri: images.companyLogo }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <Text className="font-quicksand-bold text-base text-gray-900 text-center">{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="w-3" />}
            />
          </View>
          <View className="flex-1" />
        </ScrollView>
      )}
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
            className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
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
