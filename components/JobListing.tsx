import { formatDate, getApplicationStatus, getEmploymentType, getWorkArrangement } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
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
  appliedAt,
  handleQuickApply,
}: {
  job: Job;
  showFavorite?: boolean;
  showStatus?: boolean;
  status?: string;
  appliedAt?: string;
  showQuickApply?: boolean;
  canQuickApply?: boolean;
  handleQuickApply?: () => void;
}) => {
  const { isAuthenticated } = useAuthStore();
  const renderQuickApply = () => {
    if (appliedAt && isAuthenticated) {
      return (
        <View
          className="bg-emerald-100 rounded-xl px-4 py-2 border border-emerald-200"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-2">
            <Feather name="check-circle" size={14} color="#059669" />
            <Text className="font-quicksand-bold text-sm text-emerald-700">
              Applied on {appliedAt ? formatDate(appliedAt) : ""}
            </Text>
          </View>
        </View>
      );
    }
    if (canQuickApply) {
      return (
        <TouchableOpacity
          onPress={handleQuickApply}
          className="bg-green-500 rounded-xl px-4 py-2"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-2">
            <Feather name="zap" size={14} color="white" />
            <Text className="font-quicksand-bold text-sm text-white">Quick Apply</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
      case "interviewed":
        return { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" };
      case "offered":
        return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
    }
  };

  return (
    <View
      className="w-full bg-white rounded-2xl p-5 my-2 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/jobs/${job.id}`)}>
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-1 mr-3">
            <CompanyInformation company={job.businessName} />
          </View>
          <View className="flex-row items-center gap-3">
            {showStatus && status && (
              <View
                className={`${getStatusColor(status).bg} ${getStatusColor(status).border} border px-3 py-1 rounded-full`}
              >
                <Text className={`font-quicksand-bold text-xs ${getStatusColor(status).text}`}>
                  {getApplicationStatus(status)}
                </Text>
              </View>
            )}
            {showFavorite && <FavoriteJob jobId={job.id} />}
          </View>
        </View>

        <Text className="font-quicksand-bold text-xl text-gray-900 mb-1">{job.title}</Text>
        <View className="flex-row items-center gap-4 mb-3">
          <View className="flex-row items-center gap-1">
            <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center">
              <Feather name="eye" size={12} color="#3b82f6" />
            </View>
            <Text className="font-quicksand-semibold text-sm text-blue-700">
              {job.views || 0} {(job.views || 0) === 1 ? "view" : "views"}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
              <Feather name="users" size={12} color="#10b981" />
            </View>
            <Text className="font-quicksand-semibold text-sm text-emerald-700">
              {job.applicants || 0} {(job.applicants || 0) === 1 ? "applicant" : "applicants"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2 mb-1 flex-wrap">
          <View className="flex-row items-center gap-1">
            <Feather name="map-pin" size={14} color="#6b7280" />
            <Text className="font-quicksand-medium text-sm text-gray-600">{job.location}</Text>
          </View>
          <View className="w-1 h-1 bg-gray-400 rounded-full" />
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={14} color="#6b7280" />
            <Text className="font-quicksand-medium text-sm text-gray-600">{getEmploymentType(job.employmentType)}</Text>
          </View>
          <View className="w-1 h-1 bg-gray-400 rounded-full" />
          <View className="flex-row items-center gap-1">
            <Feather name="home" size={14} color="#6b7280" />
            <Text className="font-quicksand-medium text-sm text-gray-600">{getWorkArrangement(job.setting)}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2 mb-4">
          <Text className="font-quicksand-bold text-base text-emerald-600">
            ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>

      {job.tags && job.tags.length > 0 && (
        <ScrollView
          className="flex-row gap-2 mb-2"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {job.tags.map((tag, index) => (
            <View key={index} className="bg-green-50 border border-green-200 px-3 py-1 mr-1 rounded-full">
              <Text className="font-quicksand-medium text-xs text-green-700">{tag.name}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <View className="flex-row items-center justify-between">
        {showQuickApply && renderQuickApply()}
        <TouchableOpacity
          onPress={() => router.push(`/jobs/${job.id}`)}
          className="bg-gray-100 rounded-xl px-4 py-2 border border-gray-200"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-2">
            <Feather name="eye" size={14} color="#6b7280" />
            <Text className="font-quicksand-semibold text-sm text-gray-700">View Details</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JobListing;
