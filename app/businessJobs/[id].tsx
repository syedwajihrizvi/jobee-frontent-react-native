import BackBar from "@/components/BackBar";
import ExpandableText from "@/components/ExpandableText";
import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { useJobsForBusiness } from "@/lib/services/useJobs";
import { formatDate, getEmploymentType, getWorkArrangement } from "@/lib/utils";
import useApplicationStore from "@/store/applications.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import { Feather, Fontisto, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessJobDetails = () => {
  const { id: jobId } = useLocalSearchParams();
  const { data: job, isLoading } = useJobsForBusiness(Number(jobId));
  const { hasValidShortListedCache, refreshShortListedApplicationsForJob } = useApplicationStore();
  const { getPendingApplicationsForJob, getInterviewsForJob } = useBusinessJobsStore();
  useEffect(() => {
    if (jobId && !hasValidShortListedCache(Number(jobId))) {
      refreshShortListedApplicationsForJob(Number(jobId));
    }
  }, [jobId]);
  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      <BackBar label="Job Management" />
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4"
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
            className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100"
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
                <Text className="font-quicksand-bold text-2xl text-gray-900 leading-8 mb-1">{job.title}</Text>
                <View className="flex-row items-center gap-2 mb-1 flex-wrap">
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
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {getWorkArrangement(job.setting)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="font-quicksand-bold text-base text-emerald-600">
                    ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
                  </Text>
                </View>
                <View className="gap-1">
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
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-3 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                <Feather name="trending-up" size={16} color="#8b5cf6" />
              </View>
              <Text className="font-quicksand-bold text-lg text-gray-900">Performance Metrics</Text>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 items-center">
                <Text className="font-quicksand-semibold text-xs text-blue-700">Views</Text>
                <Text className="font-quicksand-bold text-lg text-blue-800">{job.views || 0}</Text>
              </View>

              <View className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-3 items-center">
                <Text className="font-quicksand-semibold text-xs text-emerald-700">Applied</Text>
                <Text className="font-quicksand-bold text-lg text-emerald-800">{job.applicants}</Text>
              </View>

              <View className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3 items-center">
                <Text className="font-quicksand-semibold text-xs text-amber-700">Pending</Text>
                <Text className="font-quicksand-bold text-lg text-amber-800">
                  {getPendingApplicationsForJob(Number(job.id))}
                </Text>
              </View>

              <View className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3 items-center">
                <Text className="font-quicksand-semibold text-xs text-purple-700">Interviews</Text>
                <Text className="font-quicksand-bold text-lg text-purple-800">
                  {getInterviewsForJob(Number(job.id))}
                </Text>
              </View>
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                <Feather name="file-text" size={20} color="#6366f1" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Job Description</Text>
            </View>

            <ExpandableText text={job.description} length={400} />
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100"
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
            className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100"
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
                <Fontisto name="persons" size={20} color="#f97316" />
              </View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Hiring Team</Text>
            </View>

            <View>
              {job.hiringTeam.map((member) => (
                <View
                  key={member.email}
                  className="bg-white rounded-xl border border-gray-200 p-4 mb-3"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                        {member.profileImageUrl ? (
                          <Image
                            source={{ uri: getS3BusinessProfileImage(member?.profileImageUrl) }}
                            className="size-10 rounded-full"
                          />
                        ) : (
                          <Text className="font-quicksand-bold text-blue-600 text-sm">
                            {member.firstName.charAt(0)}
                            {member.lastName.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-quicksand-bold text-base text-gray-900">
                          {member.firstName} {member.lastName}
                        </Text>
                        <Text className="font-quicksand-medium text-sm text-gray-600">{member.email}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View className="flex-1" />
        </ScrollView>
      ) : null}

      {job && (
        <View
          className="bg-white border-t border-gray-200 px-4 py-6 absolute bottom-0 left-0 right-0 flex-row gap-2"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View className="flex-row gap-3 w-1/2">
            <TouchableOpacity
              className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() =>
                router.push(`/businessJobs/applications/${jobId}?jobTitle=${encodeURIComponent(job.title)}`)
              }
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="users" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-base">View Applicants</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-3 w-1/2">
            <TouchableOpacity
              className="flex-1 bg-purple-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => router.push(`/businessJobs/interviews/${jobId}?jobTitle=${encodeURIComponent(job.title)}`)}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={18} color="white" />
                <Text className="font-quicksand-bold text-white text-base">View Interviews</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BusinessJobDetails;
