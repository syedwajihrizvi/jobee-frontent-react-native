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

  return (
    <TouchableOpacity
      className="mb-3 bg-white rounded-xl p-4 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      }}
      activeOpacity={0.7}
      onPress={() => router.push(`/businessJobs/${job.id}?companyId=${user?.companyId}`)}
    >
      <View className="mb-3">
        <Text className="font-quicksand-bold text-lg text-gray-900 leading-5 mb-2" numberOfLines={2}>
          {job.title}
        </Text>

        <View className="flex-row items-center gap-2 mb-2 flex-wrap">
          <View className="flex-row items-center gap-1">
            <Feather name="map-pin" size={12} color="#6b7280" />
            <Text className="font-quicksand-medium text-xs text-gray-600">
              {job.location || `${job.city}, ${job.country}`}
            </Text>
          </View>
          <View className="w-1 h-1 bg-gray-400 rounded-full" />
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={12} color="#6b7280" />
            <Text className="font-quicksand-medium text-xs text-gray-600">{getEmploymentType(job.employmentType)}</Text>
          </View>
          <View className="w-1 h-1 bg-gray-400 rounded-full" />
          <View className="flex-row items-center gap-1">
            <Feather name="home" size={12} color="#6b7280" />
            <Text className="font-quicksand-medium text-xs text-gray-600">{getWorkArrangement(job.setting)}</Text>
          </View>
        </View>
        <Text className="font-quicksand-medium text-xs text-amber-700">{getJobLevel(job?.level)}</Text>
        <View className="flex-row items-center justify-between w-4/5">
          <Text className="font-quicksand-bold text-sm text-emerald-600">
            ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 mb-3">
        <View className="bg-blue-50 rounded-lg px-2 py-1 items-center justify-between flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Feather name="eye" size={10} color="#3b82f6" />
            <Text className="font-quicksand-medium text-xs text-blue-700">Views</Text>
          </View>
          <Text className="font-quicksand-bold text-sm text-blue-800">{job.views || "0"}</Text>
        </View>

        <View className="bg-emerald-50 rounded-lg px-2 py-1 items-center justify-between flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Feather name="users" size={10} color="#10b981" />
            <Text className="font-quicksand-medium text-xs text-emerald-700">Applied</Text>
          </View>
          <Text className="font-quicksand-bold text-sm text-emerald-800">{job.applicants}</Text>
        </View>

        <View className="bg-amber-50 rounded-lg px-2 py-1 items-center justify-between flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={10} color="#f59e0b" />
            <Text className="font-quicksand-medium text-xs text-amber-700">Pending</Text>
          </View>
          <Text className="font-quicksand-bold text-sm text-amber-800">{job.pendingApplicationsSize || "0"}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
        <Text className="font-quicksand-medium text-xs text-gray-500">Posted {formatDate(job.createdAt)}</Text>
        <View className="w-6 h-6 bg-indigo-100 rounded-full items-center justify-center">
          <Feather name="chevron-right" size={12} color="#6366f1" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BusinessJobListings;
