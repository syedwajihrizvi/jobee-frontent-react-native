import { getEmploymentType, getJobLevel, getJobLevelColor, getWorkArrangement } from "@/lib/utils";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const JobDetails = ({ job }: { job: Job }) => {
  const levelColor = getJobLevelColor(job.level);

  return (
    <View className="flex-row items-center gap-2 mb-3 flex-wrap">
      <View className="flex-row items-center gap-1">
        <Feather name="map-pin" size={12} color="#6b7280" />
        <Text className="font-quicksand-medium text-xs text-gray-600">{job.location}</Text>
      </View>
      <Text>·</Text>
      <View className="flex-row items-center gap-1">
        <Feather name="clock" size={12} color="#6b7280" />
        <Text className="font-quicksand-medium text-xs text-gray-600">{getEmploymentType(job.employmentType)}</Text>
      </View>
      <Text>·</Text>
      <View className="flex-row items-center gap-1">
        <Feather name="home" size={12} color="#6b7280" />
        <Text className="font-quicksand-medium text-xs text-gray-600">{getWorkArrangement(job.setting)}</Text>
      </View>
      <Text>·</Text>
      <View className="flex-row items-center gap-1">
        <Feather name="trending-up" size={12} color={levelColor.iconColor} />
        <Text className={`font-quicksand-medium text-xs ${levelColor.color}`}>{getJobLevel(job.level)}</Text>
      </View>
    </View>
  );
};

export default JobDetails;
