import BackBar from "@/components/BackBar";
import CompanyInformation from "@/components/CompanyInformation";
import PrepareWithJobee from "@/components/PrepareWithJobee";
import { images } from "@/constants";
import { prepareForInterview } from "@/lib/interviewEndpoints";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { convertTo12Hour, getInterviewStyle } from "@/lib/utils";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InterviewDetails = () => {
  const { id: interviewId } = useLocalSearchParams();
  const [showInterviewPrepModal, setShowInterviewPrepModal] = useState(false);
  const [isSendingInterviewPrepRequest, setIsSendingInterviewPrepRequest] =
    useState(false);
  const { data: interviewDetails, isLoading } = useInterviewDetails(
    Number(interviewId)
  );
  const handlePrepareWithJobee = () => {
    if (interviewDetails?.preparationStatus === "NOT_STARTED") {
      setShowInterviewPrepModal(true);
    } else if (interviewDetails?.preparationStatus === "IN_PROGRESS") {
      console.log("Already in progress");
    } else {
      console.log("Already prepared");
    }
  };

  const renderInterviePrepText = () => {
    if (interviewDetails?.preparationStatus === "NOT_STARTED") {
      return "Prepare with Jobee";
    } else if (interviewDetails?.preparationStatus === "IN_PROGRESS") {
      return "Continue Preparing";
    } else {
      return "Prepared";
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
        Alert.alert(
          "Success",
          "You are all set! We will notify you once we are ready. Approximately 5 minutes"
        );
        console.log("Preparation started");
        handleShowInterviewPrepModalClose();
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again later.");
    } finally {
      setIsSendingInterviewPrepRequest(false);
    }
  };

  return (
    <SafeAreaView className="h-full relative">
      <BackBar label="Interview Details" />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <ScrollView className="p-4 mb-20">
          <CompanyInformation company={interviewDetails?.companyName!} />
          <View>
            <Text className="font-quicksand-bold text-lg">
              {interviewDetails?.title}
            </Text>
            <Text className="font-quicksand-medium text-md">
              {interviewDetails?.description}
            </Text>
            <TouchableOpacity
              className="bg-green-200 px-4 py-2 rounded-full w-2/5 mt-2"
              onPress={() => router.push(`/jobs/${interviewDetails?.jobId}`)}
            >
              <Text className="font-quicksand-bold text-green-800 text-sm">
                View Job Posting
              </Text>
            </TouchableOpacity>
          </View>
          <View className="divider my-4" />
          <View>
            <Text className="font-quicksand-bold text-lg">Details</Text>
            <View className="flex flex-wrap flex-row gap-2">
              <Text className="font-quicksand-semibold text-sm text-green-800 bg-green-200 px-2 py-1 rounded-full">
                {interviewDetails?.interviewDate}
              </Text>
              <Text className="font-quicksand-semibold text-sm text-green-800 bg-green-200 px-2 py-1 rounded-full">
                {convertTo12Hour(interviewDetails?.startTime!)} -{" "}
                {convertTo12Hour(interviewDetails?.endTime!)}
              </Text>
              <Text className="font-quicksand-semibold text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded-full">
                {interviewDetails?.timezone}
              </Text>
              <Text className="font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full">
                {getInterviewStyle(interviewDetails?.interviewType!)}
              </Text>
            </View>
            <View className="mt-2 flex flex-row flex-wrap gap-2">
              {interviewDetails?.location && (
                <View>
                  <MaterialIcons name="location-on" size={24} color="black" />
                  <Text className="font-quicksand-medium text-md mt-2">
                    {interviewDetails?.location}
                  </Text>
                </View>
              )}
              {interviewDetails?.phoneNumber && (
                <View className="rounded-full bg-blue-200 flex flex-row items-center justify-center gap-2 py-2 px-4">
                  <MaterialIcons name="phone" size={16} color="black" />
                  <Text className="font-quicksand-medium text-sm">
                    {interviewDetails?.phoneNumber}
                  </Text>
                </View>
              )}
              {interviewDetails?.meetingLink && (
                <View className="rounded-full bg-blue-200 flex flex-row items-center justify-center gap-2 py-2 px-4">
                  <AntDesign name="link" size={16} color="black" />
                  <Text className="font-quicksand-medium text-sm">
                    Meeting Link
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View className="divider my-4" />
          <View>
            <Text className="font-quicksand-bold text-lg">
              Preperation Tips From Company
            </Text>
            <View className="p-4 border border-gray-300 rounded-lg mt-2">
              {interviewDetails?.preparationTipsFromInterviewer.map(
                (note, index) => (
                  <View key={index} className="flex flex-row items-start mb-2">
                    <Feather
                      name="check-square"
                      size={12}
                      color="green"
                      className="mt-1 mr-2"
                    />
                    <Text className="font-quicksand-semibold text-md flex-shrink">
                      {note}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
          <View className="divider my-4" />
          <View>
            <Text className="font-quicksand-bold text-lg">Interviewers</Text>
            <View className="flex flex-row flex-wrap">
              {[
                ...(interviewDetails?.interviewers ?? []),
                ...(interviewDetails?.otherInterviewers ?? []),
              ].map((interviewer, index) => (
                <View key={index} className="flex flex-col items-center p-4">
                  <Image
                    source={{ uri: images.companyLogo }}
                    className="w-16 h-16 rounded-full"
                  />
                  <Text className="font-quicksand-bold text-md">
                    {interviewer.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
      <View className="w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center px-4">
        <TouchableOpacity
          className="apply-button w-1/2 items-center flex-row  gap-2 justify-center h-14"
          onPress={handlePrepareWithJobee}
        >
          <Text className="font-quicksand-semibold text-md">
            {renderInterviePrepText()}
          </Text>
          <Ionicons name="sparkles" size={20} color="gold" />
        </TouchableOpacity>
        <TouchableOpacity className="favorite-button w-1/2 h-14 items-center justify-center">
          <Text>Reschedule</Text>
        </TouchableOpacity>
      </View>
      <PrepareWithJobee
        visible={showInterviewPrepModal}
        handlePrepareWithJobeeConfirm={handlePrepareWithJobeeConfirm}
        company={interviewDetails?.companyName!}
        handleClose={handleShowInterviewPrepModalClose}
      />
    </SafeAreaView>
  );
};

export default InterviewDetails;
