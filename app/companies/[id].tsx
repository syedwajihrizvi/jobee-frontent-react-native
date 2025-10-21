import BackBar from "@/components/BackBar";
import { useCompany } from "@/lib/services/useCompany";
import { useMostRecentJobsAtCompany } from "@/lib/services/useJobs";
import { formatDate, getWorkArrangement } from "@/lib/utils";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CompanyInfo = () => {
  const { id } = useLocalSearchParams();
  const { data: company, isLoading } = useCompany(Number(id));
  const { data: jobs, isLoading: isLoadingJobs } = useMostRecentJobsAtCompany(Number(id));
  const [jobCount, setJobCount] = useState(0);
  useEffect(() => {
    const fetchJobCount = async () => {
      try {
        const response = await fetch(`http://192.168.2.29:8080/jobs/companies/${id}/job-count`);
        const jobCount = await response.json();
        setJobCount(jobCount);
      } catch (error) {
        console.error("Error fetching job count:", error);
      }
    };
    fetchJobCount();
  }, [id, company, isLoading]);
  // Mock data for demonstration - replace with actual company properties
  const mockData = {
    description:
      "A leading technology company focused on innovation and digital transformation. We build cutting-edge solutions that help businesses scale and succeed in the modern digital landscape.",
    moreJobs: [
      {
        id: 1,
        title: "Senior Frontend Developer",
        department: "Engineering",
        location: "San Francisco, CA",
        type: "Full-time",
        postedDays: 3,
      },
      {
        id: 2,
        title: "Product Manager",
        department: "Product",
        location: "Remote",
        type: "Full-time",
        postedDays: 5,
      },
      {
        id: 3,
        title: "UX Designer",
        department: "Design",
        location: "New York, NY",
        type: "Contract",
        postedDays: 7,
      },
    ],
  };

  const formatLocation = () => {
    const parts = [company?.hqCity, company?.hqState, company?.hqCountry].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not specified";
  };

  const formatEmployeeCount = (count: number | undefined) => {
    if (!count) return "Not specified";
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const getCompanySizeCategory = (employees: number | undefined) => {
    if (!employees) return { label: "Unknown", color: "text-gray-600", bg: "bg-gray-100" };
    if (employees < 50) return { label: "Startup", color: "text-green-600", bg: "bg-green-100" };
    if (employees < 200) return { label: "Small", color: "text-blue-600", bg: "bg-blue-100" };
    if (employees < 1000) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Large", color: "text-purple-600", bg: "bg-purple-100" };
  };

  const sizeCategory = getCompanySizeCategory(company?.numEmployees);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar label="Company Info" />
      <View className="px-4 pb-4 border-b border-gray-100 mt-4">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <FontAwesome5 name="building" size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-gray-900">{company?.name || "Company Name"}</Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">Company Information</Text>
          </View>
          {company?.website && (
            <TouchableOpacity className="p-2">
              <Feather name="external-link" size={18} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="py-4 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Feather name="calendar" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-xs text-gray-600">Founded</Text>
              </View>
              <Text className="font-quicksand-bold text-sm text-gray-900">{company?.foundedYear || "N/A"}</Text>
            </View>

            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <FontAwesome5 name="users" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-xs text-gray-600">Employees</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold text-sm text-gray-900">
                  {formatEmployeeCount(company?.numEmployees)}
                </Text>
                <View className={`${sizeCategory.bg} px-2 py-0.5 rounded-full`}>
                  <Text className={`font-quicksand-bold text-xs ${sizeCategory.color}`}>{sizeCategory.label}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Feather name="map-pin" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-xs text-gray-600">Headquarters</Text>
              </View>
              <Text className="font-quicksand-bold text-sm text-gray-900">{formatLocation()}</Text>
            </View>

            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <MaterialIcons name="business" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-xs text-gray-600">Industry</Text>
              </View>
              <Text className="font-quicksand-bold text-sm text-gray-900">{company?.industry || "Not specified"}</Text>
            </View>
          </View>
        </View>
        {company?.website && (
          <View className="py-4 border-t border-gray-100">
            <TouchableOpacity className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                  <Feather name="globe" size={18} color="#3b82f6" />
                </View>
                <View>
                  <Text className="font-quicksand-bold text-sm text-blue-900">Visit Company Website</Text>
                  <Text className="font-quicksand-medium text-xs text-blue-700">{company.website}</Text>
                </View>
              </View>
              <Feather name="external-link" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        )}
        <View className="py-4 border-t border-gray-100">
          <Text className="font-quicksand-bold text-base text-gray-900 mb-1">About the Company</Text>

          <Text className="font-quicksand-medium text-sm text-gray-700 leading-6">
            {company?.description || mockData.description}
          </Text>
        </View>
        <View className="py-4 border-t border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-quicksand-bold text-base text-gray-900">
              Jobs at {company?.name || "this Company"}
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1 mb-1"
              onPress={() => router.push(`/users/jobs?companyName=${company?.name}`)}
            >
              <Text className="font-quicksand-semibold text-sm text-blue-600">View All</Text>
              <Feather name="chevron-right" size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          {isLoadingJobs ? (
            <View className="items-center justify-center">
              <ActivityIndicator color="#3b82f6" size="large" />
              <Text className="font-quicksand-medium text-sm text-gray-600 mt-2">Loading jobs...</Text>
            </View>
          ) : (
            <View className="gap-3">
              {jobs?.map((job, _) => (
                <TouchableOpacity
                  key={job.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                  activeOpacity={0.7}
                  onPress={() => router.push(`/jobs/${job.id}`)}
                >
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-sm text-gray-900">{job.title}</Text>
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center gap-1">
                          <FontAwesome5 name="layer-group" size={10} color="#6b7280" />
                          <Text className="font-quicksand-medium text-xs text-gray-600">{job.department}</Text>
                        </View>
                        <View className="w-1 h-1 bg-gray-400 rounded-full" />
                        <View className="flex-row items-center gap-1">
                          <Feather name="map-pin" size={10} color="#6b7280" />
                          <Text className="font-quicksand-medium text-xs text-gray-600">{job.location}</Text>
                        </View>
                        <View className="w-1 h-1 bg-gray-400 rounded-full" />
                        <View className="flex-row items-center gap-1 w-3/4">
                          <Feather name="map-pin" size={10} color="#6b7280" />
                          <Text className="font-quicksand-medium text-xs text-gray-600">
                            {getWorkArrangement(job.setting)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-quicksand-medium text-xs text-gray-500">{formatDate(job.createdAt)}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                      <View className="w-4 h-4 bg-green-100 rounded-full items-center justify-center">
                        <Feather name="briefcase" size={8} color="#21c48f" />
                      </View>
                      <Text className="font-quicksand-medium text-xs text-green-600">Quick Apply Available</Text>
                    </View>
                    <Feather name="chevron-right" size={12} color="#6b7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="bg-blue-500 border border-blue-600 rounded-xl p-3 mt-3 flex-row items-center justify-center gap-2"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => router.push(`/users/jobs?companyName=${company?.name}`)}
          >
            <Feather name="search" size={16} color="white" />
            <Text className="font-quicksand-bold text-white text-sm">
              Browse All Jobs at {company?.name || "Company"}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="py-4 border-t border-gray-100">
          <Text className="font-quicksand-bold text-base text-gray-900 mb-3">Company Stats</Text>

          <View className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="items-center flex-1">
                <Text className="font-quicksand-bold text-lg text-gray-900">{jobCount}</Text>
                <Text className="font-quicksand-medium text-xs text-gray-600 text-center">Open Positions</Text>
              </View>
              <View className="w-px h-8 bg-gray-300" />
              <View className="items-center flex-1">
                <Text className="font-quicksand-bold text-lg text-gray-900">{company?.rating || 0}</Text>
                <Text className="font-quicksand-medium text-xs text-gray-600 text-center">Company Rating</Text>
              </View>
              <View className="w-px h-8 bg-gray-300" />
            </View>

            <View className="flex-row items-center justify-center gap-1">
              <Feather name="trending-up" size={12} color="#10b981" />
              <Text className="font-quicksand-medium text-xs text-emerald-600">
                Actively hiring across multiple departments
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompanyInfo;
