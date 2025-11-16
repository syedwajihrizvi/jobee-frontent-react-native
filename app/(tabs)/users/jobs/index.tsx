import CompleteProfileReminder from "@/components/CompleteProfileReminder";
import FilterStatus from "@/components/FilterStatus";
import JobFiltersView from "@/components/JobFiltersView";
import JobListing from "@/components/JobListing";
import QuickApplyModal from "@/components/QuickApplyModal";
import RecommededJobApplySuccessModal from "@/components/RecommededJobApplySuccessModal";
import RecommendedJobsPreview from "@/components/RecommendedJobsPreview";
import SearchBar from "@/components/SearchBar";
import { sounds } from "@/constants";
import { quickApplyToJob } from "@/lib/jobEndpoints";
import { onActionSuccess } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Application, Job, JobFilters, User } from "@/type";
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

  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [showRecommendedJobsModalSuccess, setShowRecommendedJobsModalSuccess] = useState(false);
  const [quickApplyJob, setQuickApplyJob] = useState<Job | null>(null);
  const [quickApplyLabel, setQuickApplyLabel] = useState("");
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const {
    refreshJobsForUserAndFilter,
    refreshRecommendedJobs,
    getJobsByFilter,
    fetchJobsForUserAndFilter,
    getPaginationForJobsByFilter,
    getRecommendedJobs,
    isLoadingJobsForFilter,
    isLoadingRecommendedJobs,
    hasValidCachedJobs,
    hasValidRecommendedJobsCache,
    addAppliedJob,
  } = useUserJobsStore();
  const { user: authUser, isLoading: isAuthLoading, userType, isAuthenticated } = useAuthStore();
  const user = authUser as User | null;
  const { setApplications, applications, setLastApplication } = useUserStore();
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

  const handleQuickApply = (job: Job) => {
    setQuickApplyJob(job);
    setQuickApplyLabel(`Quick Apply for ${job.title} at ${job.businessName}`);
    setShowQuickApplyModal(true);
  };

  const handleUnAuthenticatedQuickApply = () => {
    setQuickApplyJob(null);
    setShowQuickApplyModal(false);
    router.push("/(auth)/sign-in");
  };

  const handleQuickApplyClose = async (apply: boolean) => {
    if (apply && quickApplyJob) {
      const res = await quickApplyToJob(quickApplyJob.id);
      if (res != null) {
        const newApplication = {
          id: res.id,
          appliedAt: res.appliedAt,
          jobId: quickApplyJob.id,
          status: res.status,
        } as Application;
        setApplications([newApplication, ...applications]);
        setLastApplication(res);
        addAppliedJob(quickApplyJob);
        player.seekTo(0);
        player.play();
        await onActionSuccess();
      }
    }
    setQuickApplyJob(null);
    setShowQuickApplyModal(false);
  };

  const filteredJobs = getJobsByFilter(filters);
  const paginatedFilteredJobs = getPaginationForJobsByFilter(filters);
  const isLoadingFilteredJobs = isLoadingJobsForFilter(filters);
  const recommendedJobs = getRecommendedJobs();
  const isLoadingRecommended = isLoadingRecommendedJobs();

  return (
    <SafeAreaView className={`relative flex-1 bg-white${isAuthenticated ? " pb-20" : ""}`}>
      <StatusBar hidden={true} />
      <View className="w-full items-center justify-center mb-4">
        <SearchBar placeholder="Search for Jobs..." onSubmit={handleSearchSubmit} />
      </View>
      {isAuthenticated && user?.canQuickApplyBatch && (
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
          return <JobListing key={index} job={item} handleQuickApply={() => handleQuickApply(item)} />;
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

      <QuickApplyModal
        visible={showQuickApplyModal}
        label={quickApplyLabel}
        handleClose={handleQuickApplyClose}
        canQuickApply={!!user?.primaryResume}
        handleUnAuthenticatedQuickApply={handleUnAuthenticatedQuickApply}
      />
    </SafeAreaView>
  );
};

export default Jobs;
