import CompleteProfileReminder from "@/components/CompleteProfileReminder";
import FilterStatus from "@/components/FilterStatus";
import JobFiltersView from "@/components/JobFiltersView";
import JobListing from "@/components/JobListing";
import RecommededJobApplySuccessModal from "@/components/RecommededJobApplySuccessModal";
import RecommendedJobsPreview from "@/components/RecommendedJobsPreview";
import SearchBar from "@/components/SearchBar";
import { sounds } from "@/constants";
import { onActionSuccess } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Application, JobFilters, User } from "@/type";
import { useAudioPlayer } from "expo-audio";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StatusBar, View } from "react-native";
import { runOnJS, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const Jobs = () => {
  const { companyName } = useLocalSearchParams();
  const defaultFilters: JobFilters = {
    search: "",
    locations: [],
    companies: [],
    tags: [],
    distance: "",
    minSalary: undefined,
    maxSalary: undefined,
    experience: [],
    employmentTypes: [],
    workArrangements: [],
  };
  const player = useAudioPlayer(sounds.popSound);
  const [filters, setFilters] = useState<JobFilters>({ ...defaultFilters });

  const [showRecommendedJobsModalSuccess, setShowRecommendedJobsModalSuccess] = useState(false);
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const {
    refreshJobsForUserAndFilter,
    refreshRecommendedJobs,
    getJobsByFilter,
    fetchJobsForUserAndFilter,
    getPaginationForJobsByFilter,
    getRecommendations,
    isLoadingJobsForFilter,
    isLoadingRecommendedJobs,
    hasValidCachedJobs,
    hasValidRecommendedJobsCache,
  } = useUserJobsStore();
  const { user: authUser, isLoading: isAuthLoading, userType, isAuthenticated } = useAuthStore();
  const user = authUser as User | null;
  const [isViewingRecommended, setIsViewRecommended] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileCompleteReminder, setShowProfileCompleteReminder] = useState(
    !user?.profileComplete && isAuthenticated
  );
  const slideX = useSharedValue(screenWidth);

  useEffect(() => {
    if (isAuthenticated && userType === "user") {
      const cacheValid = hasValidRecommendedJobsCache();
      if (!cacheValid) {
        refreshRecommendedJobs();
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const cacheValid = hasValidCachedJobs(filters);
    if (!cacheValid) {
      refreshJobsForUserAndFilter(filters);
    }
  }, []);

  useEffect(() => {
    const cacheValid = hasValidCachedJobs(filters);
    if (!cacheValid) {
      refreshJobsForUserAndFilter(filters);
    }
  }, [filters]);

  useEffect(() => {
    if (companyName) {
      setTempFilterCount(1);
      setFilters((prev) => ({ ...prev, companies: [companyName as string] }));
      setFilterCount(1);
    }
  }, [companyName]);

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

  const handleProfileComplete = () => {
    setShowProfileCompleteReminder(false);
    router.push("/userProfile/completeProfile");
  };

  const handleProfileLater = () => {
    setShowProfileCompleteReminder(false);
  };

  const handleFilterApply = (selectedFilters: JobFilters) => {
    setFilters(selectedFilters);
    setFilterCount(tempFilterCount);
    closeFilters();
  };

  const handleClearFilters = () => {
    setTempFilterCount(0);
    setFilterCount(0);
    setFilters({ ...defaultFilters });
  };

  if (userType === "business") {
    return <Redirect href="/(tabs)/business/jobs" />;
  }

  const filteredJobs = getJobsByFilter(filters);
  const paginatedFilteredJobs = getPaginationForJobsByFilter(filters);
  const isLoadingFilteredJobs = isLoadingJobsForFilter(filters);
  const recommendedJobs = getRecommendations();
  const isLoadingRecommended = isLoadingRecommendedJobs();

  console.log(
    "Recommended Jobs NOW:",
    recommendedJobs.map((rec) => rec.job.id)
  );
  if (!isAuthenticated && !isLoadingFilteredJobs && filteredJobs.length === 0) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  return (
    <SafeAreaView className={`relative flex-1 bg-white${isAuthenticated ? " pb-20" : ""}`}>
      <StatusBar hidden={true} />
      <View className="w-full items-center justify-center mb-4">
        <SearchBar placeholder="Search for Jobs..." onSubmit={handleSearchSubmit} />
      </View>
      {isAuthenticated && user?.canQuickApplyBatch && recommendedJobs.length > 0 && (
        <View className="m-4 my-2">
          <RecommendedJobsPreview
            recommendedJobs={recommendedJobs}
            isLoadingRecommended={isLoadingRecommended}
            isViewingRecommended={isViewingRecommended}
            handleViewAll={() => setIsViewRecommended(!isViewingRecommended)}
            handleBatchQuickApplySuccess={async (newApplications: Application[]) => {
              player.seekTo(0);
              player.play();
              await onActionSuccess();
              setShowRecommendedJobsModalSuccess(true);
            }}
          />
        </View>
      )}
      <View className="mx-4">
        <FilterStatus
          filterCount={filterCount}
          filters={filters}
          openFilters={openFilters}
          handleClearFilters={handleClearFilters}
        />
      </View>
      {!isAuthLoading && showProfileCompleteReminder && (
        <CompleteProfileReminder onComplete={handleProfileComplete} onLater={handleProfileLater} />
      )}
      <FlatList
        className="w-full px-4"
        data={filteredJobs}
        renderItem={({ item, index }) => {
          return <JobListing key={index} job={item} />;
        }}
        onEndReached={() => {
          if (paginatedFilteredJobs?.hasMore && !isLoadingFilteredJobs) {
            const nextPage = (paginatedFilteredJobs?.currentPage || 0) + 1;
            fetchJobsForUserAndFilter(filters, nextPage);
          }
        }}
        ListFooterComponent={() => {
          return isLoadingFilteredJobs ? <ActivityIndicator size="small" color="green" /> : null;
        }}
        ItemSeparatorComponent={() => <View className="divider" />}
      />
      {isOpen && (
        <JobFiltersView
          slideX={slideX}
          closeFilters={closeFilters}
          defaultFilters={filters}
          tempFilterCount={tempFilterCount}
          setTempFilterCount={setTempFilterCount}
          handleFilterApply={handleFilterApply}
          handleClearFilters={handleClearFilters}
        />
      )}
      <RecommededJobApplySuccessModal
        showRecommendedJobsModalSuccess={showRecommendedJobsModalSuccess}
        setShowRecommendedJobsModalSuccess={setShowRecommendedJobsModalSuccess}
        recommendedJobs={recommendedJobs || []}
      />
    </SafeAreaView>
  );
};

export default Jobs;
