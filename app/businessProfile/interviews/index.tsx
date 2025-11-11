import BackBar from "@/components/BackBar";
import InterviewCard from "@/components/InterviewCard";
import InterviewFilterButton from "@/components/InterviewFilterButton";
import { useBusinessProfileInterviews } from "@/lib/services/useBusinessProfileInterviews";
import { InterviewFilter } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Interviews = () => {
  const { data: interviews, isLoading } = useBusinessProfileInterviews();
  const [filteredInterviews, setFilteredInterviews] = useState(interviews);
  const [filter, setFilter] = useState<InterviewFilter | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (interviews && !isLoading) {
      let filteredInterviews = [...interviews];
      if (filter === "Upcoming") {
        console.log("Filtering Upcoming");
        filteredInterviews = filteredInterviews.filter((i) => i.status === "SCHEDULED");
      } else if (filter === "Completed") {
        console.log("Filtering Completed");
        filteredInterviews = filteredInterviews.filter((i) => i.status === "COMPLETED");
      } else if (filter === "Pending Decision") {
        console.log("Filtering Pending Decision");
        filteredInterviews = filteredInterviews.filter((i) => i.decisionResult === "PENDING");
      } else if (filter === "Hired") {
        console.log("Filtering Hired");
        filteredInterviews = filteredInterviews.filter((i) => i.decisionResult === "HIRED");
      } else if (filter === "Next Round") {
        console.log("Filtering Next Round");
        filteredInterviews = filteredInterviews.filter((i) => i.decisionResult === "NEXT_ROUND");
      } else if (filter === "Rejected") {
        console.log("Filtering Rejected");
        filteredInterviews = filteredInterviews.filter((i) => i.decisionResult === "REJECTED");
      }

      setFilteredInterviews(filteredInterviews);
    }
  }, [interviews, filter, isLoading]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interviews" />
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          className="p-2"
          data={filteredInterviews}
          renderItem={({ item }) => (
            <View className="px-2">
              <InterviewCard
                interview={item}
                handlePress={() => router.push(`/businessJobs/interviews/interview/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-6">
              <View
                className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="calendar" size={32} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Interviews Yet</Text>
              <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
                When you schedule interviews for this job, they will appear here.
              </Text>
            </View>
          )}
          ListHeaderComponent={() =>
            interviews && interviews.length > 0 ? (
              <>
                <View
                  className="mx-2 mb-6 bg-white rounded-2xl p-5 border border-gray-100"
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
                      <Feather name="calendar" size={24} color="#6366f1" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-xl text-gray-900">Your Interviews</Text>
                      <Text className="font-quicksand-medium text-sm text-gray-600">
                        View and manage all your interviews
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <Text className="font-quicksand-bold text-2xl text-blue-600">{interviews?.length}</Text>
                      <Text className="font-quicksand-medium text-sm text-blue-700">
                        Total Interview{`${interviews?.length > 1 ? "s" : ""}`}
                      </Text>
                    </View>
                    <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
                      <Text className="font-quicksand-bold text-2xl text-green-600">{interviews?.length}</Text>
                      <Text className="font-quicksand-medium text-sm text-green-700">
                        Completed Interview{`${interviews?.length > 1 ? "s" : ""}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  className="bg-white mx-2 mb-4 rounded-2xl p-4 border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center">
                        <Feather name="filter" size={12} color="#8b5cf6" />
                      </View>
                      <Text className="font-quicksand-bold text-base text-gray-900">Filter Interviews</Text>
                    </View>
                    <TouchableOpacity
                      className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center"
                      onPress={() => setShowFilters(!showFilters)}
                    >
                      <Feather name={`chevron-${showFilters ? "up" : "down"}`} size={16} color="#8b5cf6" />
                    </TouchableOpacity>
                  </View>
                  {showFilters && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                      <InterviewFilterButton
                        handlePress={() => setFilter(null)}
                        count={interviews?.length || 0}
                        label="All"
                        isActive={filter == null}
                        iconName="list"
                        iconColor="#6366f1"
                        theme="indigo"
                        shadowColor="#6366f1"
                      />
                      <InterviewFilterButton
                        handlePress={() => setFilter("Upcoming")}
                        count={interviews?.filter((i) => i.status === "SCHEDULED").length || 0}
                        label="Upcoming"
                        isActive={filter === "Upcoming"}
                        iconName="calendar"
                        iconColor="#3b82f6"
                        theme="blue"
                        shadowColor="#3b82f6"
                      />
                      <InterviewFilterButton
                        handlePress={() => setFilter("Completed")}
                        count={interviews?.filter((i) => i.status === "COMPLETED").length || 0}
                        label="Completed"
                        isActive={filter === "Completed"}
                        iconName="check-circle"
                        iconColor="#10b981"
                        theme="green"
                        shadowColor="#10b981"
                      />
                      <InterviewFilterButton
                        handlePress={() => setFilter("Pending Decision")}
                        count={interviews?.filter((i) => i.decisionResult === "PENDING").length || 0}
                        label="Pending Decision"
                        isActive={filter === "Pending Decision"}
                        iconName="clock"
                        iconColor="#f59e0b"
                        theme="amber"
                        shadowColor="#f59e0b"
                      />
                      <InterviewFilterButton
                        handlePress={() => setFilter("Hired")}
                        count={interviews?.filter((i) => i.decisionResult === "HIRED").length || 0}
                        label="Hired"
                        isActive={filter === "Hired"}
                        iconName="user-check"
                        iconColor="#059669"
                        theme="emerald"
                        shadowColor="#059669"
                      />
                      <InterviewFilterButton
                        handlePress={() => setFilter("Next Round")}
                        count={interviews?.filter((i) => i.decisionResult === "NEXT_ROUND").length || 0}
                        label="Next Round"
                        isActive={filter === "Next Round"}
                        iconName="refresh-cw"
                        iconColor="#8b5cf6"
                        theme="purple"
                        shadowColor="#8b5cf6"
                      />
                      <InterviewFilterButton
                        handlePress={() => setFilter("Rejected")}
                        count={interviews?.filter((i) => i.decisionResult === "REJECTED").length || 0}
                        label="Rejected"
                        isActive={filter === "Rejected"}
                        iconName="x-circle"
                        iconColor="#ef4444"
                        theme="red"
                        shadowColor="#ef4444"
                      />
                    </View>
                  )}
                </View>
              </>
            ) : null
          }
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
    </SafeAreaView>
  );
};

export default Interviews;
