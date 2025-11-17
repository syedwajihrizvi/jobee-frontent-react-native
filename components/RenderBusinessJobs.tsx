import useAuthStore from "@/store/auth.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import { BusinessUser, JobFilters } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StatusBar, Text, View } from "react-native";
import { runOnJS, useSharedValue, withTiming } from "react-native-reanimated";
import BusinessJobListings from "./BusinessJobListings";
import FilterStatus from "./FilterStatus";
import JobFiltersView from "./JobFiltersView";
import RenderCompanyLogo from "./RenderCompanyLogo";
import SearchBar from "./SearchBar";

const screenWidth = Dimensions.get("window").width;

type Props = {
  postedByAccountId?: number;
  showHeader?: boolean;
};

const RenderBusinessJobs = ({ postedByAccountId, showHeader = true }: Props) => {
  const defaultFilters: JobFilters = {
    search: "",
    locations: [],
    tags: [],
    minSalary: undefined,
    maxSalary: undefined,
    employmentTypes: [],
    workArrangements: [],
    experience: [],
    postedByAccountId: postedByAccountId ? postedByAccountId : undefined,
  };

  const { user: businessUser } = useAuthStore();
  const user = businessUser as BusinessUser | null;
  const slideX = useSharedValue(screenWidth);
  const [filters, setFilters] = useState<JobFilters>({ ...defaultFilters });
  const [filterCount, setFilterCount] = useState(0);
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const {
    refreshJobsForBusinessAndFilter,
    fetchJobsForBusinessAndFilter,
    getInterviewsForJobAndFilter,
    hasValidCachedJobs,
    getPaginationForJobAndFilter,
    isLoadingJobsForBusinessAndFilter,
  } = useBusinessJobsStore();

  useEffect(() => {
    const cacheValid = hasValidCachedJobs(filters);
    if (!cacheValid) {
      refreshJobsForBusinessAndFilter(filters);
    }
  }, []);

  useEffect(() => {
    const cacheValid = hasValidCachedJobs(filters);
    if (!cacheValid) {
      refreshJobsForBusinessAndFilter(filters);
    }
  }, [filters]);

  const openFilters = () => {
    slideX.value = withTiming(0, { duration: 300 });
    setIsOpen(true);
  };

  const closeFilters = () => {
    slideX.value = withTiming(screenWidth, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
      }
    });
  };

  const handleSearchSubmit = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text }));
    closeFilters();
  };

  const handleFilterApply = (selectedFilters: JobFilters) => {
    setFilters({ ...selectedFilters });
    setFilterCount(tempFilterCount);
    closeFilters();
  };

  const handleClearFilters = () => {
    setTempFilterCount(0);
    setFilterCount(0);
    setFilters({ ...defaultFilters });
    closeFilters();
  };

  const isLoading = isLoadingJobsForBusinessAndFilter(filters);
  const jobs = getInterviewsForJobAndFilter(filters);
  const pagination = getPaginationForJobAndFilter(filters);
  return (
    <>
      <StatusBar hidden={true} />
      <View className="w-full flex-row items-center justify-center px-2 gap-4">
        <SearchBar placeholder="Search for Jobs..." onSubmit={(text) => handleSearchSubmit(text)} />
      </View>
      {showHeader && (
        <View
          className="mx-4 mt-3 bg-white rounded-2xl px-3 py-2 border border-gray-100"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="items-center justify-center">
              <RenderCompanyLogo logoUrl={user?.companyLogo || ""} />
            </View>
            <View>
              <Text className="font-quicksand-bold text-xl text-gray-900">Jobs</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600">
                {user?.role === "ADMIN" && "View all your company's job listings"}
                {user?.role === "RECRUITER" && "View all your job listings"}
                {user?.role === "EMPLOYEE" && "View jobs whose hiring team you are part of"}
              </Text>
            </View>
          </View>
        </View>
      )}
      <View className="mx-4 my-2">
        <FilterStatus
          filterCount={filterCount}
          filters={filters}
          openFilters={openFilters}
          handleClearFilters={handleClearFilters}
        />
      </View>
      <FlatList
        data={jobs}
        renderItem={({ item }) => <BusinessJobListings job={item} />}
        ItemSeparatorComponent={() => <View className="divider" />}
        style={{ paddingHorizontal: 16 }}
        onEndReached={() => {
          if (pagination?.hasMore) {
            const nextPage = pagination.currentPage + 1;
            fetchJobsForBusinessAndFilter(filters, nextPage);
          }
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center px-6 py-20">
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
              <Feather name="briefcase" size={32} color="#3b82f6" />
            </View>

            <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Jobs Found</Text>

            <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6 mb-6 max-w-xs">
              {filters.search || filterCount > 0
                ? "No jobs match your current search criteria. Try adjusting your filters or search terms."
                : "You haven't posted any jobs yet. Create your first job posting to get started."}
            </Text>
          </View>
        )}
        ListFooterComponent={() => {
          return isLoading ? <ActivityIndicator size="small" color="green" /> : null;
        }}
      />
      {isOpen && (
        <JobFiltersView
          slideX={slideX}
          closeFilters={closeFilters}
          defaultFilters={defaultFilters}
          tempFilterCount={tempFilterCount}
          setTempFilterCount={setTempFilterCount}
          handleFilterApply={handleFilterApply}
          handleClearFilters={handleClearFilters}
        />
      )}
    </>
  );
};

export default RenderBusinessJobs;
