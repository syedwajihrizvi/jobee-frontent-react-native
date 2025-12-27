import BackBar from "@/components/BackBar";
import CheckList from "@/components/CheckList";
import CustomMultilineInput from "@/components/CustomMultilineInput";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import { sendUnofficalJobOffer } from "@/lib/interviewEndpoints";
import { useApplicant, useInterviewDetails } from "@/lib/services/useProfile";
import useApplicationStore from "@/store/applications.store";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const JobOffer = () => {
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const { applicantId, interviewId } = useLocalSearchParams();
  const { setApplicationStatus } = useApplicationStore();
  const { data: interview, isLoading: isLoadingInterview } = useInterviewDetails(Number(interviewId));
  const { data: applicant, isLoading: isLoadingApplicant } = useApplicant(Number(applicantId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<string>("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await sendUnofficalJobOffer(Number(interviewId), form);
      if (res) {
        Alert.alert("Success", "Unofficial job offer sent to candidate.");
        queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
        queryClient.invalidateQueries({ queryKey: ["applicant", applicantId] });
        setApplicationStatus(interview?.jobId!, Number(applicantId!), "OFFER_MADE");
        router.navigate(`/businessJobs/applications/applicant/${applicantId}?&interviewId=${interviewId}`);
      } else {
        Alert.alert("Error", "There was an error sending the unofficial job offer. Please try again.");
      }
    } catch (error) {
      console.error("Error sending unofficial job offer:", error);
      Alert.alert("Error", "There was an error sending the unofficial job offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Job Offer" />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
        enableResetScrollToCoords={false}
      >
        <View className="mt-6 mb-4">
          <Text className="font-quicksand-bold text-2xl text-gray-900 mb-2">Send Job Offer</Text>
          <Text className="font-quicksand-medium text-sm text-gray-600">
            Send an unofficial job offer to gauge candidate interest
          </Text>
        </View>

        <View
          className="bg-white rounded-2xl p-5 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="font-quicksand-bold text-base text-gray-900 mb-2">How This Works</Text>
          <CheckList
            items={[
              "Candidate receives a notification",
              "Candidate can accept or reject the unoffical offer",
              "Begin formal hiring process if accepted",
              "This is not a binding formal offer",
              "You can follow up with more details later",
            ]}
            withBorder={false}
          />
        </View>
        <View
          className="bg-white rounded-2xl p-5 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center gap-3 mb-4">
            <RenderUserProfileImage
              profileImageUrl={interview?.candidateProfileImageUrl}
              profileImageSize={14}
              fullName={interview?.candidateName || "Candidate"}
            />
            <View className="flex-1">
              <Text className="font-quicksand-bold text-lg text-gray-900">
                {interview?.candidateName || "Candidate Name"}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Feather name="briefcase" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Job Applicant</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="bg-emerald-500 rounded-xl py-3 items-center justify-center"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
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
              <Feather name="eye" size={16} color="white" />
              <Text className="font-quicksand-bold text-white text-base">View Profile</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="mb-6">
          <CustomMultilineInput
            label="Message to Candidate"
            numberOfLines={5}
            value={form}
            placeholder="We would love to extend an unofficial job offer to you. Please let us know if you are interested in proceeding further."
            onChangeText={(text) => setForm(text)}
          />
        </View>
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1 bg-emerald-500 py-4 rounded-xl items-center justify-center"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="font-quicksand-bold text-base text-white">Send Offer</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-gray-200 py-4 rounded-xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="font-quicksand-bold text-base text-gray-700">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default JobOffer;
