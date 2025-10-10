import BackBar from "@/components/BackBar";
import JobListing from "@/components/JobListing";
import { useJobsByUserApplications } from "@/lib/services/useJobs";
import useAuthStore from "@/store/auth.store";
import { Job } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppliedJobs = () => {
  const { user } = useAuthStore();
  const { data: jobs, isLoading: isLoadingJobs } = useJobsByUserApplications(user?.id);

  const renderJobsSelectedFor = () => {
    const totalJobs = !jobs || jobs.length === 0 ? 0 : jobs.filter((job) => job.status === "SELECTED").length;
    if (totalJobs === 0) {
      return (
        <View className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <Text className="font-quicksand-bold text-2xl text-emerald-600">0</Text>
          <Text className="font-quicksand-medium text-sm text-emerald-700">Keep applying! You got this!</Text>
        </View>
      );
    }
    return (
      <View className="flex-1 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
        <Text className="font-quicksand-bold text-2xl text-emerald-600">{totalJobs}</Text>
        <Text className="font-quicksand-medium text-sm text-emerald-700">{`Interview${totalJobs > 1 ? "s" : ""}`}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <BackBar label="Applied Jobs" />
      {isLoadingJobs ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full p-2"
          data={jobs || []}
          renderItem={({ item, index }: { item: { job: Job; status: string; appliedAt: string }; index: number }) => (
            <JobListing
              key={index}
              job={item.job}
              showFavorite={false}
              showStatus={true}
              showQuickApply={true}
              canQuickApply={false}
              status={item.status}
              appliedAt={item.appliedAt}
            />
          )}
          ListHeaderComponent={() => (
            <View
              className="mx-4 mb-6 bg-white rounded-2xl p-5 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center gap-3 mb-4">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                  <Feather name="folder" size={24} color="#6366f1" />
                </View>
                <View>
                  <Text className="font-quicksand-bold text-xl text-gray-900">Job Applications</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    View the status of your job applications
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <Text className="font-quicksand-bold text-2xl text-blue-600">{jobs?.length}</Text>
                  <Text className="font-quicksand-medium text-sm text-blue-700">Jobs Applied To</Text>
                </View>
                {renderJobsSelectedFor()}
              </View>
            </View>
          )}
          ListEmptyComponent={() => {
            return (
              <View className="p-4 flex-1 justify-center items-center">
                <Feather name="briefcase" size={64} color="black" />
                <Text className="font-quicksand-bold text-xl text-gray-600 mt-4">You have not appied to any jobs</Text>
                <Text className="font-quicksand-regular text-gray-500 text-center mt-2 text-lg">
                  Upload a resume and start applying.
                </Text>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default AppliedJobs;
