import { useApplicationById } from "@/lib/services/useJobs";
import { formatDate, getApplicationStatus, getStatusColor } from "@/lib/utils";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const ApplicationInfo = ({ applicationId }: { applicationId: number }) => {
  const { data: application, isLoading } = useApplicationById(applicationId);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        <View className="flex-1 items-center justify-center p-4">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
          <Text className="font-quicksand-semibold text-base text-gray-600">Loading Application Info...</Text>
        </View>
      </View>
    );
  }

  if (!application) {
    return (
      <View className="flex-1 bg-white">
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="font-quicksand-semibold text-base text-gray-600">Application not found</Text>
        </View>
      </View>
    );
  }

  const statusColors = getStatusColor(getApplicationStatus(application.status || ""));

  return (
    <View className="flex-1 bg-white">
      <View className="items-center py-3">
        <View className="w-12 h-1 bg-gray-300 rounded-full" />
      </View>
      <View className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-emerald-100 rounded-lg items-center justify-center">
            <Feather name="file-text" size={18} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-gray-900">Application Status</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">Your application details</Text>
          </View>
        </View>
      </View>
      <View className="flex-1 p-4">
        {/* Status Message */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <Text className="font-quicksand-semibold text-sm text-emerald-800 leading-6">
            You have already applied to this job. Our team is reviewing your application and will get back to you soon.
          </Text>
        </View>
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Application Details</Text>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={14} color="#6b7280" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Applied On</Text>
              </View>
              <Text className="font-quicksand-bold text-sm text-gray-900">{formatDate(application.appliedAt!)}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="track-changes" size={14} color="#6b7280" />
                <Text className="font-quicksand-medium text-sm text-gray-600">Status</Text>
              </View>
              <View className={`${statusColors.bg} ${statusColors.border} border rounded-lg px-3 py-1`}>
                <Text className={`font-quicksand-bold text-xs ${statusColors.text}`}>
                  {getApplicationStatus(application.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {application?.interviewId && (
          <TouchableOpacity
            className="bg-blue-500 border border-blue-600 rounded-xl p-4 flex-row items-center justify-center gap-2"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => router.push(`/userProfile/interviews/${application?.interviewId}`)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="video-call" size={20} color="white" />
            <Text className="font-quicksand-bold text-base text-white">Interview Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ApplicationInfo;
