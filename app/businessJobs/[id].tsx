import ActionButton from "@/components/ActionButton";
import BackBar from "@/components/BackBar";
import { useJobsForBusiness, useShortListedCandidatesForJob } from "@/lib/services/useJobs";
import { formatDate, getEmploymentType, getWorkArrangement } from "@/lib/utils";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessJobDetails = () => {
  const { id: jobId, companyId } = useLocalSearchParams();
  const { data: job, isLoading } = useJobsForBusiness(Number(companyId), Number(jobId));
  const { data: shortListedCandidates, isLoading: loadingShortListedCandidates } = useShortListedCandidatesForJob(
    Number(jobId)
  );

  const getApplicationRate = () => {
    if (!job?.views || job.views === 0) return 0;
    return Math.round((job.applicants / job.views) * 100);
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      <BackBar label="Job Management" />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text className="font-quicksand-semibold text-lg text-gray-700">Loading job details...</Text>
        </View>
      ) : job ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text className="font-quicksand-bold text-2xl text-gray-900 leading-8 mb-2">{job.title}</Text>
                <View className="flex-row items-center gap-2 mb-3 flex-wrap">
                  <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">{job.location}</Text>
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
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {getWorkArrangement(job.setting)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Feather name="dollar-sign" size={16} color="#059669" />
                  <Text className="font-quicksand-bold text-base text-emerald-600">
                    ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
                  </Text>
                </View>

                {/* Dates */}
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Feather name="calendar" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      Posted: {formatDate(job.createdAt)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="schedule" size={14} color="#ef4444" />
                    <Text className="font-quicksand-medium text-sm text-red-600">
                      Deadline: {formatDate(job.appDeadline)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="gap-3">
                <ActionButton
                  color="bg-blue-500"
                  shadowColor="#3b82f6"
                  handlePress={() => router.push(`/businessJobs/applications/${jobId}`)}
                  count={job.applicants}
                  label={job.applicants === 1 ? "Applicant" : "Applicants"}
                />
                {!loadingShortListedCandidates && (
                  <ActionButton
                    color="bg-emerald-500"
                    shadowColor="#10b981"
                    handlePress={() => router.push(`/businessJobs/applications/${jobId}?shortListed=true`)}
                    count={shortListedCandidates ? shortListedCandidates.length : 0}
                    label="Shortlisted"
                  />
                )}
                <ActionButton
                  color="bg-gray-500"
                  shadowColor="#6b7280"
                  handlePress={() => router.push(`/businessJobs/interviews/${jobId}`)}
                  count={job.interviews}
                  label={job.interviews === 1 ? "Interview" : "Interviews"}
                />
              </View>
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                <Feather name="trending-up" size={20} color="#8b5cf6" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Performance Metrics</Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="eye" size={16} color="#3b82f6" />
                  <Text className="font-quicksand-semibold text-sm text-blue-700">Views</Text>
                </View>
                <Text className="font-quicksand-bold text-2xl text-blue-800">{job.views || 0}</Text>
              </View>

              <View className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="send" size={16} color="#10b981" />
                  <Text className="font-quicksand-semibold text-sm text-emerald-700">Applied</Text>
                </View>
                <Text className="font-quicksand-bold text-2xl text-emerald-800">{job.applicants}</Text>
              </View>

              <View className="flex-1 bg-purple-50 border border-purple-200 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="percent" size={16} color="#8b5cf6" />
                  <Text className="font-quicksand-semibold text-sm text-purple-700">Rate</Text>
                </View>
                <Text className="font-quicksand-bold text-2xl text-purple-800">{getApplicationRate()}%</Text>
              </View>
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Feather name="file-text" size={20} color="#6366f1" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Job Description</Text>
            </View>

            <Text className="font-quicksand-medium text-base text-gray-700 leading-6">{job.description}</Text>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                <Feather name="tag" size={20} color="#f97316" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Skills & Tags</Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {job.tags.map((tag) => (
                <View
                  key={tag.id}
                  className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl"
                  style={{
                    shadowColor: "#f97316",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text className="text-orange-800 font-quicksand-semibold text-sm">{tag.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Feather name="user-check" size={20} color="#22c55e" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Candidates Under Consideration</Text>
            </View>

            <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
              <Feather name="users" size={24} color="#6b7280" />
              <Text className="font-quicksand-medium text-gray-600 mt-2">No candidates chosen yet</Text>
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-6 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                <Feather name="calendar" size={20} color="#f59e0b" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Upcoming Interviews</Text>
            </View>

            <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
              <Feather name="calendar" size={24} color="#6b7280" />
              <Text className="font-quicksand-medium text-gray-600 mt-2">No interviews scheduled</Text>
            </View>
          </View>
          <View className="flex-1" />
        </ScrollView>
      ) : null}

      {job && (
        <View
          className="bg-white border-t border-gray-200 px-4 py-6 absolute bottom-0 left-0 right-0"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => router.push(`/businessJobs/applications/${jobId}`)}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="users" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-base">View All Applicants</Text>
              </View>
            </TouchableOpacity>

            {shortListedCandidates && shortListedCandidates.length > 0 && (
              <TouchableOpacity
                className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => router.push(`/businessJobs/applications/${jobId}?shortListed=true`)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="star" size={18} color="white" />
                  <Text className="font-quicksand-bold text-white text-base">View Shortlist</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BusinessJobDetails;
