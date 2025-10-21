import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ModalWithBg from "./ModalWithBg";

type Props = {
  showRecommendedJobsModalSuccess: boolean;
  setShowRecommendedJobsModalSuccess: (show: boolean) => void;
  recommendedJobs: { job: Job; match: number }[];
};

const RecommededJobApplySuccessModal = ({
  showRecommendedJobsModalSuccess,
  setShowRecommendedJobsModalSuccess,
  recommendedJobs,
}: Props) => {
  return (
    <ModalWithBg visible={showRecommendedJobsModalSuccess} customHeight={0.45} customWidth={0.85}>
      <View className="flex-1 justify-center items-center p-6">
        <View
          className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View
            className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Feather name="check" size={24} color="white" />
          </View>
        </View>
        <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-2">Applications Sent! 🎉</Text>
        <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6 mb-2">
          You have successfully applied to all recommended jobs!
        </Text>
        <Text className="font-quicksand-medium text-sm text-gray-500 text-center leading-5 mb-6">
          Your applications are now being reviewed by employers. We will notify you of any updates.
        </Text>
        <View
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-3 w-full"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Feather name="send" size={16} color="#059669" />
            <Text className="font-quicksand-bold text-emerald-700 text-base">
              {recommendedJobs?.length || 0} Applications Submitted
            </Text>
          </View>
        </View>
        <View className="flex-row w-full">
          <TouchableOpacity
            className="flex-1 bg-gray-100 border border-gray-200 rounded-xl py-4 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => setShowRecommendedJobsModalSuccess(false)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <Feather name="x" size={16} color="#6b7280" />
              <Text className="font-quicksand-bold text-gray-700 text-base">Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ModalWithBg>
  );
};

export default RecommededJobApplySuccessModal;
