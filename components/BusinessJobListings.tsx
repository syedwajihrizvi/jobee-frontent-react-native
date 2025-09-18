import { formatDate, getEmploymentType, getWorkArrangement } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { BusinessUser, Job } from "@/type";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const BusinessJobListings = ({ job }: { job: Job }) => {
  const { user: authUser } = useAuthStore();
  const user = authUser as BusinessUser | null;

  return (
    <View className="w-full px-4 py-2 rounded-full">
      <TouchableOpacity
        activeOpacity={0.2}
        onPress={() =>
          router.push(`/businessJobs/${job.id}?companyId=${user?.companyId}`)
        }
      >
        <View className="flex-row items-start justify-between">
          <Text className="font-quicksand-bold text-2xl w-2/3">
            {job.title}
          </Text>
          <Text className="font-quicksand-semibold text-sm text-black border border-black px-2 py-1 rounded-full">
            {job.applicants} {`Applicant${job.applicants !== 1 ? "s" : ""}`}
          </Text>
        </View>
        <Text className="font-quicksand-medium text-md">
          {job.location} · {getEmploymentType(job.employmentType)} ·{" "}
          {getWorkArrangement(job.setting)}
        </Text>
        <Text className="font-quicksand-semibold text-sm">
          ${job.minSalary} - ${job.maxSalary}
        </Text>
        <Text className="font-quicksand-semibold text-sm">
          Deadline: {formatDate(job.createdAt)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BusinessJobListings;
