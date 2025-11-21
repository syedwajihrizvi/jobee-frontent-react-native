import { formatSWord } from "@/lib/utils";
import useUserJobsStore from "@/store/userJobsStore";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const JobMetrics = ({ job }: { job: Job }) => {
  const { getTotalViewsForJobById, getTotalApplicationsForJobById } = useUserJobsStore();

  const totalViews = getTotalViewsForJobById(job.id) || job.views || 0;
  const totalApplications = getTotalApplicationsForJobById(job.id) || job.applicationCount || 0;
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <View className="flex-row items-center gap-1">
        <Feather name="eye" size={12} color="#6b7280" />
        <Text className="font-quicksand-medium text-xs text-gray-600">{totalViews} views</Text>
      </View>
      <Text>·</Text>
      <View className="flex-row items-center gap-1">
        <Feather name="users" size={12} color="#10b981" />
        <Text className="font-quicksand-medium text-xs text-emerald-700">
          {totalApplications === 0 ? "Be first" : `${totalApplications} ${formatSWord("applicant", totalApplications)}`}
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
