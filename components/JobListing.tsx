import {
  formatDate,
  getApplicationStatus,
  getEmploymentType,
} from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { Job } from "@/type";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CompanyInformation from "./CompanyInformation";
import FavoriteJob from "./FavoriteJob";

const JobListing = ({
  job,
  showFavorite = true,
  showStatus = false,
  status,
  showQuickApply = true,
  canQuickApply = true,
  handleQuickApply,
}: {
  job: Job;
  showFavorite?: boolean;
  showStatus?: boolean;
  status?: string;
  showQuickApply?: boolean;
  canQuickApply?: boolean;
  handleQuickApply?: () => void;
}) => {
  const { isAuthenticated } = useAuthStore();
  const renderQuickApply = () => {
    if (isAuthenticated && !canQuickApply) {
      return (
        <View className="mt-4 w-1/4">
          <Text className="text-center font-quicksand-semibold text-sm text-white bg-green-500 rounded-full px-3 py-1">
            Applied
          </Text>
        </View>
      );
    }
    if (canQuickApply) {
      return (
        <TouchableOpacity onPress={handleQuickApply}>
          <View className="mt-4 w-1/3">
            <Text className="text-center font-quicksand-semibold text-sm text-white bg-black rounded-full px-3 py-1">
              Quick Apply
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View className="w-full p-4 rounded-full">
      <TouchableOpacity
        activeOpacity={0.2}
        onPress={() => router.push(`/jobs/${job.id}`)}
      >
        <View className="flex-row items-center justify-between">
          <CompanyInformation company={job.businessName} />
          {showFavorite && <FavoriteJob jobId={job.id} />}
          {showStatus && status && (
            <View className="absolute top-0 right-0 bg-green-100 px-2 py-1 rounded-full">
              <Text className="font-quicksand-bold text-sm color-green-800">
                {getApplicationStatus(status)}
              </Text>
            </View>
          )}
        </View>
        <Text className="font-quicksand-bold text-xl">{job.title}</Text>
        <Text className="font-quicksand-medium text-lg">
          {job.location} | {getEmploymentType(job.employmentType)}
        </Text>
        <Text className="font-quicksand-semibold text-sm">
          ${job.minSalary} - ${job.maxSalary}
        </Text>
        {canQuickApply && (
          <Text className="font-quicksand-semibold text-sm">
            Deadline: {formatDate(job.appDeadline)}
          </Text>
        )}
      </TouchableOpacity>
      <ScrollView
        className="flex-row flex-wrap gap-2 mt-2"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {job.tags?.map((tag, index) => (
          <Text key={index} className="badge badge--green text-sm mx-1">
            {tag.name}
          </Text>
        ))}
      </ScrollView>
      {showQuickApply && renderQuickApply()}
    </View>
  );
};

export default JobListing;
