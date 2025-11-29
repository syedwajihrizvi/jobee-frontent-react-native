import { getInterviewEmptyContent, interviewFilterOptions } from "@/constants";
import { getInterviewFilterText } from "@/lib/utils";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import { InterviewFilter, InterviewFilters } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import InterviewCard from "./InterviewCard";
import RenderInterviewFilterIcon from "./RenderInterviewFilterIcon";

type Props = {
  jobId?: number;
  status?: InterviewFilter;
  filtersVisibile?: boolean;
};

const RenderInterviews = ({ jobId, status, filtersVisibile = true }: Props) => {
  const {
    fetchInterviewsForJobAndFilter,
    getInterviewsForJobAndFilter,
    getTotalCountForJobAndFilter,
    getPaginationForJobAndFilter,
    isLoadingInterviewsForJobAndFilter,
    refreshInterviewsForJobAndFilter,
    hasValidCachedInterviews,
  } = useBusinessInterviewsStore();
  const [filters, setFilters] = useState<InterviewFilters>({
    jobId: jobId ? Number(jobId) : undefined,
    search: undefined,
    status: status !== undefined ? status : undefined,
    decisionResult: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const cacheValid = hasValidCachedInterviews(filters);
    if (!cacheValid) {
      refreshInterviewsForJobAndFilter(filters);
    }
  }, []);

  useEffect(() => {
    const cacheValid = hasValidCachedInterviews(filters);
    if (!cacheValid) {
      refreshInterviewsForJobAndFilter(filters);
    }
  }, [filters]);

  const handleFilterStatusChange = (filter: InterviewFilter) => {
    const currentStatus = filters.status;
    const currentDecisionResult = filters.decisionResult;
    if (filter === "PENDING" || filter === "REJECTED") {
      const newDecisionResult = filter === currentDecisionResult ? undefined : filter;
      setFilters((prev) => ({
        ...prev,
        decisionResult: newDecisionResult,
        status: undefined,
      }));
    } else {
      const newStatus = filter === currentStatus ? undefined : filter;
      setFilters((prev) => ({
        ...prev,
        status: newStatus,
        decisionResult: undefined,
      }));
    }
  };
  const renderInterviewCount = () => {
    const count = getTotalCountForJobAndFilter(filters);
    const text = getInterviewFilterText(filters.status || filters.decisionResult || "", count);
    return (
      <View className="mb-2">
        <View
          className="bg-white rounded-xl p-2 border border-emerald-200"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
              <Feather name="calendar" size={12} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-sm text-gray-900">{text}</Text>
            </View>
            <View className="bg-emerald-500 rounded-full px-3 py-1">
              <Text className="font-quicksand-bold text-white text-xs">{count || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const interviewsData = getInterviewsForJobAndFilter(filters);
  const isLoading = isLoadingInterviewsForJobAndFilter(filters);

  const renderEmptyComponent = () => {
    const { title, message, textColor, bgColor } = getInterviewEmptyContent(filters.status || filters.decisionResult);
    return (
      <View className="flex-1 justify-center items-center p-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{
            shadowColor: "#3b82f6",
            backgroundColor: bgColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <RenderInterviewFilterIcon
            filter={(filters.status || filters.decisionResult || "SCHEDULED") as InterviewFilter}
            color={textColor}
            size={32}
          />
        </View>
        <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">{title}</Text>
        <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">{message}</Text>
      </View>
    );
  };

  return isLoading ? (
    <ActivityIndicator size="large" className="mt-10" />
  ) : (
    <FlatList
      className="p-4"
      data={interviewsData}
      renderItem={({ item }) => (
        <InterviewCard
          interview={item}
          handlePress={() => router.push(`/businessJobs/interviews/interview/${item.id}`)}
        />
      )}
      ListEmptyComponent={() => renderEmptyComponent()}
      ListHeaderComponent={() =>
        filtersVisibile && (
          <>
            <View
              className="bg-white mb-2 rounded-2xl p-2 border border-gray-100"
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
                  <Text className="font-quicksand-bold text-sm text-gray-900">Filter Interviews</Text>
                </View>
                <TouchableOpacity
                  className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center"
                  onPress={() => setShowFilters(!showFilters)}
                >
                  <Feather name={`chevron-${showFilters ? "up" : "down"}`} size={16} color="#8b5cf6" />
                </TouchableOpacity>
              </View>

              {filtersVisibile && showFilters && (
                <View>
                  <View>
                    <Text className="font-quicksand-semibold text-sm text-gray-800 mb-1">Status</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {interviewFilterOptions.map((option) => {
                        const active = filters.status === option.value || filters.decisionResult === option.value;
                        return (
                          <TouchableOpacity
                            key={option.label}
                            className=" flex-row items-center  gap-1 px-3 py-2 rounded-lg"
                            style={{
                              backgroundColor: active ? option.activeBgColor : option.bgColor,
                            }}
                            onPress={() => handleFilterStatusChange(option.value as InterviewFilter)}
                          >
                            <RenderInterviewFilterIcon
                              filter={option.value as InterviewFilter}
                              color={active ? option.activeTextColor : option.textColor}
                            />
                            <Text
                              className="font-quicksand-semibold text-xs"
                              style={{
                                color: active ? option.activeTextColor : option.textColor,
                              }}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
            </View>
            {renderInterviewCount()}
          </>
        )
      }
      onEndReached={() => {
        const pagination = getPaginationForJobAndFilter(filters);
        if (pagination?.hasMore) {
          const nextPage = pagination.currentPage + 1;
          fetchInterviewsForJobAndFilter(filters, nextPage);
        }
      }}
      ListFooterComponent={() => {
        if (!isLoading) return null;
        return <ActivityIndicator size="large" className="my-4" />;
      }}
      ItemSeparatorComponent={() => <View className="divider" />}
    />
  );
};

export default RenderInterviews;
