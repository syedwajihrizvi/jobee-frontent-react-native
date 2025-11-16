import { formatDate } from "@/lib/utils";
import useUserStore from "@/store/user.store";
import { Job } from "@/type";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const JobActions = ({
  job,
  matchScore,
  showViewDetails,
  showQuickApply,
  canQuickApply,
  handleQuickApply,
}: {
  job: Job;
  matchScore?: number;
  showViewDetails: boolean;
  showQuickApply: boolean;
  canQuickApply: boolean;
  handleQuickApply?: () => void;
}) => {
  const { hasUserAppliedToJob } = useUserStore();
  const application = hasUserAppliedToJob(job.id);

  const renderQuickApply = () => {
    if (matchScore) {
      return (
        <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
          <Text className="font-quicksand-bold text-sm text-emerald-700">{matchScore}% match</Text>
        </View>
      );
    }

    if (application) {
      return (
        <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
          <Text className="font-quicksand-medium text-xs text-emerald-700">
            Applied {formatDate(application.appliedAt)}
          </Text>
        </View>
      );
    }

    if (canQuickApply) {
      return (
        <TouchableOpacity
          onPress={handleQuickApply}
          className="bg-emerald-500 px-4 py-2 rounded-lg"
          activeOpacity={0.8}
        >
          <Text className="font-quicksand-bold text-sm text-white">Quick Apply</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View className="flex-row items-center justify-between">
      {showQuickApply && renderQuickApply()}
      {showViewDetails && (
        <TouchableOpacity
          onPress={() => router.push(`/jobs/${job.id}`)}
          className="bg-gray-100 px-4 py-2 rounded-lg"
          activeOpacity={0.7}
        >
          <Text className="font-quicksand-medium text-sm text-gray-700">View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default JobActions;
