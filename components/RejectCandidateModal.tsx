import { rejectCandidateInterview } from "@/lib/interviewEndpoints";
import useApplicationStore from "@/store/applications.store";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomMultilineInput from "./CustomMultilineInput";
import ModalWithBg from "./ModalWithBg";

type Props = {
  visible: boolean;
  interviewId: number;
  applicantId: number;
  jobId: number;
  handleClose: () => void;
  candidateName?: string;
};

const RejectCandidateModal = ({ visible, handleClose, candidateName, interviewId, applicantId, jobId }: Props) => {
  const customFeedbackFooterRef = useRef<View>(null);
  const queryClient = useQueryClient();
  const { setApplicationStatus } = useApplicationStore();
  const { removeAllInterviewsForJob } = useBusinessInterviewsStore();
  const keyboardAwareScrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customFeedback, setCustomFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rejectionReasons = [
    {
      id: "qualifications",
      title: "Lack of Required Qualifications",
      description: "Candidate doesn't meet the minimum requirements",
    },
    {
      id: "experience",
      title: "Insufficient Experience",
      description: "Not enough relevant work experience",
    },
    {
      id: "cultural_fit",
      title: "Cultural Fit",
      description: "May not align with company culture and values",
    },
    {
      id: "interview_performance",
      title: "Interview Performance",
      description: "Did not perform well during the interview process",
    },
    {
      id: "position_filled",
      title: "Position Filled",
      description: "The position has been filled by another candidate",
    },
    {
      id: "other",
      title: "Other Reason",
      description: "Please provide additional details below",
    },
  ];

  useEffect(() => {
    const keyboardListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        customFeedbackFooterRef.current?.measure((fx, fy, width, height, px, py) => {
          keyboardAwareScrollViewRef.current?.scrollToPosition(0, py + height - 100);
        });
      }, 100);
    });

    return () => {
      keyboardListener.remove();
    };
  }, []);

  const handleReject = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for rejection.");
      return;
    }

    if (selectedReason === "other" && !customFeedback.trim()) {
      Alert.alert("Error", "Please provide feedback for the rejection.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedReasonDesc = rejectionReasons.find((reason) => reason.id === selectedReason)?.title || "";
      const res = await rejectCandidateInterview(interviewId, selectedReasonDesc, customFeedback);
      if (res) {
        Alert.alert("Success", "The candidate has been rejected.");
        setApplicationStatus(jobId, Number(applicantId), "REJECTED");
        queryClient.invalidateQueries({
          queryKey: ["applicant", Number(applicantId)],
        });
        queryClient.invalidateQueries({
          queryKey: ["interviewDetails", interviewId],
        });
        queryClient.invalidateQueries({
          queryKey: ["job", "business", Number(jobId)],
        });
        removeAllInterviewsForJob(jobId);
      }
      resetAndClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSelectedReason("");
    setCustomFeedback("");
    handleClose();
  };

  return (
    <ModalWithBg visible={visible} customHeight={0.85} customWidth={0.95}>
      <View className="flex-1 bg-white rounded-2xl overflow-hidden">
        <View className="flex-row justify-between items-center px-6 py-5 border-b border-gray-200 bg-gray-50">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
              <Feather name="x-circle" size={20} color="#ef4444" />
            </View>
            <View>
              <Text className="font-quicksand-bold text-lg text-gray-900">Reject Candidate</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600">{candidateName || "Candidate"}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={resetAndClose} className="p-2 bg-gray-200 rounded-full" activeOpacity={0.7}>
            <Feather name="x" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          ref={keyboardAwareScrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
          enableAutomaticScroll={true}
          enableResetScrollToCoords={false}
        >
          <View className="p-6">
            <View className="mb-6">
              <Text className="font-quicksand-bold text-lg text-gray-900 mb-3">Reason for Rejection *</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 mb-4 leading-5">
                Select the primary reason for rejecting this candidate. This will help improve our hiring process.
              </Text>

              <View className="gap-3">
                {rejectionReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    className={`border rounded-xl p-4 ${
                      selectedReason === reason.id ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                    }`}
                    style={{
                      shadowColor: selectedReason === reason.id ? "#ef4444" : "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: selectedReason === reason.id ? 0.1 : 0.05,
                      shadowRadius: 2,
                      elevation: selectedReason === reason.id ? 2 : 1,
                    }}
                    onPress={() => setSelectedReason(reason.id)}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-start gap-3">
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center mt-0.5 ${
                          selectedReason === reason.id ? "border-red-500 bg-red-500" : "border-gray-300"
                        }`}
                      >
                        {selectedReason === reason.id && <Feather name="check" size={12} color="white" />}
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-quicksand-bold text-base mb-1 ${
                            selectedReason === reason.id ? "text-red-800" : "text-gray-900"
                          }`}
                        >
                          {reason.title}
                        </Text>
                        <Text
                          className={`font-quicksand-medium text-sm leading-5 ${
                            selectedReason === reason.id ? "text-red-700" : "text-gray-600"
                          }`}
                        >
                          {reason.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="mb-6">
              <Text className="font-quicksand-bold text-lg text-gray-900 mb-3">
                Additional Feedback {selectedReason === "other" && "*"}
              </Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 mb-4 leading-5">
                {selectedReason === "other"
                  ? "Please provide specific details about the rejection reason."
                  : "Optional feedback that will be shared with the candidate (recommended)."}
              </Text>
              <CustomMultilineInput
                value={customFeedback}
                placeholder={
                  selectedReason === "other"
                    ? "Please explain the reason for rejection..."
                    : "e.g., We encourage you to gain more experience in React Native and apply again in the future."
                }
                onChangeText={setCustomFeedback}
                customClass="border border-gray-300 rounded-xl p-4 font-quicksand-medium text-base text-gray-900 min-h-[100px]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
              <Text className="font-quicksand-medium text-xs text-gray-500 mt-2">
                {customFeedback.length}/500 characters
              </Text>
              <View ref={customFeedbackFooterRef} />
            </View>
            <View
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
              style={{
                shadowColor: "#f59e0b",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="flex-row items-start gap-3">
                <Feather name="alert-triangle" size={18} color="#d97706" />
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-sm text-amber-800 mb-1">Important Note</Text>
                  <Text className="font-quicksand-medium text-sm text-amber-700 leading-5">
                    This action cannot be undone. The candidate will receive an email notification about the rejection.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View
          className="bg-gray-50 px-6 py-4 border-t border-gray-200"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl py-4 items-center justify-center"
              onPress={resetAndClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text className="font-quicksand-bold text-gray-700 text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onPress={handleReject}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Feather name="loader" size={16} color="white" />
                    <Text className="font-quicksand-bold text-white text-base">Rejecting...</Text>
                  </>
                ) : (
                  <>
                    <Feather name="x-circle" size={16} color="white" />
                    <Text className="font-quicksand-bold text-white text-base">Reject Candidate</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ModalWithBg>
  );
};

export default RejectCandidateModal;
