import { formatDate, getEmploymentType, getJobLevel, getWorkArrangement } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { BusinessUser, Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const BusinessJobListings = ({ job }: { job: Job }) => {
  const { user: authUser } = useAuthStore();
  const user = authUser as BusinessUser | null;
  console.log("Rendering job listing for job:", job);
  return (
    <TouchableOpacity
      className="mb-4 bg-white rounded-2xl p-5 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
      activeOpacity={0.7}
      onPress={() => router.push(`/businessJobs/${job.id}?companyId=${user?.companyId}`)}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="font-quicksand-bold text-xl text-gray-900 leading-6 mb-2">{job.title}</Text>
          <View className="flex-row items-center gap-2 mb-2 flex-wrap">
            <View className="flex-row items-center gap-1">
              <Feather name="map-pin" size={14} color="#6b7280" />
              <Text className="font-quicksand-medium text-sm text-gray-600">
                {job.location || `${job.city}, ${job.country}`}
              </Text>
            </View>
            <View className="w-1 h-1 bg-gray-400 rounded-full" />
            <View className="flex-row items-center gap-1">
              <Feather name="clock" size={14} color="#6b7280" />
              <Text className="font-quicksand-medium text-sm text-gray-600">
                {getEmploymentType(job.employmentType)}
              </Text>
            </View>
            <View className="w-1 h-1 bg-gray-400 rounded-full" />
            <View className="flex-row items-center gap-1">
              <Feather name="home" size={14} color="#6b7280" />
              <Text className="font-quicksand-medium text-sm text-gray-600">{getWorkArrangement(job.setting)}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="font-quicksand-bold text-base text-emerald-600">
              ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
            </Text>
          </View>
          <Text className="font-quicksand-semibold text-sm text-amber-700">{getJobLevel(job?.level)}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1">
            <Feather name="calendar" size={14} color="#6b7280" />
            <Text className="font-quicksand-medium text-sm text-gray-600">Posted: {formatDate(job.createdAt)}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Feather name="chevron-right" size={16} color="#6366f1" />
          </View>
        </View>
      </View>
      <View className="flex-row gap-3 mt-3">
        <View className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <View className="flex-row items-center gap-2">
            <Feather name="eye" size={14} color="#3b82f6" />
            <Text className="font-quicksand-bold text-sm text-blue-700">Views</Text>
          </View>
          <Text className="font-quicksand-bold text-lg text-blue-800 mt-1">{job.views || "0"}</Text>
        </View>

        <View className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <View className="flex-row items-center gap-2">
            <Feather name="users" size={14} color="#10b981" />
            <Text className="font-quicksand-bold text-sm text-emerald-700">Applied</Text>
          </View>
          <Text className="font-quicksand-bold text-lg text-emerald-800 mt-1">{job.applicants}</Text>
        </View>

        <View className="flex-1 bg-purple-50 border border-purple-200 rounded-xl p-3">
          <View className="flex-row items-center gap-2">
            <Feather name="trending-up" size={14} color="#8b5cf6" />
            <Text className="font-quicksand-bold text-sm text-purple-700">Rate</Text>
          </View>
          <Text className="font-quicksand-bold text-lg text-purple-800 mt-1">
            {job.views ? Math.round((job.applicants / job.views) * 100) : 0}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BusinessJobListings;
