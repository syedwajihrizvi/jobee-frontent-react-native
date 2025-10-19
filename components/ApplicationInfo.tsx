import { useApplicationById } from "@/lib/services/useJobs";
import { formatDate, getApplicationStatus } from "@/lib/utils";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const ApplicationInfo = ({ applicationId }: { applicationId: number }) => {
  const { data: application, isLoading } = useApplicationById(applicationId);
  return !isLoading && application ? (
    <View className="p-4">
      <Text className="font-quicksand-bold text-2xl">Application Status</Text>
      <Text className="font-quicksand-semibold text-base mt-2">
        You have already applied to this job. Our team is reviewing your application and will get back to you soon.
      </Text>
      <View className="divider" />
      <Text className="font-quicksand-bold text-xl">Application Details</Text>
      <View className="mt-2">
        <Text className="font-quicksand-semibold text-base">
          Applied On: <Text className="font-quicksand-bold">{formatDate(application?.appliedAt!)}</Text>
        </Text>
        <Text className="font-quicksand-semibold text-base">
          Status: <Text className="font-quicksand-bold">{getApplicationStatus(application?.status)}</Text>
        </Text>
      </View>
      {application?.interviewId && (
        <View className="flex items-center justify-center my-4">
          <TouchableOpacity
            className="apply-button w-1/2 items-center justify-center h-14"
            onPress={() => router.push(`/userProfile/interviews/${application?.interviewId}`)}
          >
            <Text className="font-quicksand-semibold text-lg">Interview Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ) : (
    <View className="p-4 items-center justify-center flex-1">
      <ActivityIndicator size="large" />
      <Text className="font-quicksand-semibold text-base mt-2">Loading Application Info...</Text>
    </View>
  );
};

export default ApplicationInfo;
