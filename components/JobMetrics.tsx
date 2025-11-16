import { formatSWord } from "@/lib/utils";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const JobMetrics = ({ job }: { job: Job }) => {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="flex-row items-center gap-1">
        <Feather name="eye" size={12} color="#6b7280" />
        <Text className="font-quicksand-medium text-xs text-gray-600">{job.views || 0} views</Text>
      </View>
      <Text>·</Text>
      <View className="flex-row items-center gap-1">
        <Feather name="users" size={12} color="#10b981" />
        <Text className="font-quicksand-medium text-xs text-emerald-700">
          {job.applicationCount === 0
            ? "Be first"
            : `${job.applicationCount} ${formatSWord("applicant", job.applicationCount)}`}
        </Text>
      </View>
      <Text>·</Text>
      <Text className="font-quicksand-bold text-sm text-emerald-600">
        ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
      </Text>
    </View>
  );
};

export default JobMetrics;
