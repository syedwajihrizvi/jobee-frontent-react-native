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
import { useJobs, useRecommendedJobs, useUserAppliedJobs } from "@/lib/services/useJobs";
import { hasUserAppliedToJob, onActionSuccess } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { Application, JobFilters, User, UserProfileSummary } from "@/type";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StatusBar, View } from "react-native";
import { runOnJS, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const Jobs = () => {
  const { profileSummary, setProfileSummary } = useProfileSummaryStore();
  const { companyName } = useLocalSearchParams();
  const defaultFilters: JobFilters = {
    search: "",
    locations: [],
    companies: [],
    tags: [],
    distance: "",
    minSalary: undefined,
    maxSalary: undefined,
    experience: "ANY",
    employmentTypes: [],
    workArrangements: [],
  };
  const player = useAudioPlayer(sounds.popSound);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JobFilters>({ ...defaultFilters });

  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [showRecommendedJobsModalSuccess, setShowRecommendedJobsModalSuccess] = useState(false);
  const [quickApplyJob, setQuickApplyJob] = useState<number | null>(null);
  const [quickApplyLabel, setQuickApplyLabel] = useState("");
  const [tempFilterCount, setTempFilterCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const { data: jobs, isLoading, fetchNextPage, hasNextPage } = useJobs(filters);
  const { data: recommendedJobs, isLoading: isLoadingRecommended } = useRecommendedJobs();
  const { data: appliedJobs, isLoading: isAppliedJobsLoading } = useUserAppliedJobs();
  const [isViewingRecommended, setIsViewRecommended] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user: authUser, isLoading: isAuthLoading, userType, isAuthenticated, setUser } = useAuthStore();
  const user = authUser as User | null;
  const [showProfileCompleteReminder, setShowProfileCompleteReminder] = useState(
    !user?.profileComplete && isAuthenticated
  );
  const [localApplyJobs, setLocalApplyJobs] = useState<number[]>(appliedJobs || []);
  const slideX = useSharedValue(screenWidth);

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

  const handleQuickApply = (jobId: number, jobTitle: string, companyName: string) => {
    setQuickApplyJob(jobId);
    setQuickApplyLabel(`Quick Apply for ${jobTitle} at ${companyName}`);
    setShowQuickApplyModal(true);
  };

  const updateUserApplications = (newApplications: Application[]) => {
    const updatedApplications = [...newApplications, ...(user?.applications || [])];
    setUser(user ? { ...user, applications: updatedApplications } : user);
  };
  const handleUnAuthenticatedQuickApply = () => {
    setQuickApplyJob(null);
    setShowQuickApplyModal(false);
    router.push("/(auth)/sign-in");
  };

  const handleQuickApplyClose = async (apply: boolean) => {
    if (apply && quickApplyJob) {
      const res = await quickApplyToJob(quickApplyJob);
      if (res != null) {
        queryClient.invalidateQueries({
          queryKey: ["job", quickApplyJob, "application"],
        });
        queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
        const updatedProfileSummary = {
          ...profileSummary,
          lastApplication: res,
          totalApplications: (profileSummary?.totalApplications || 0) + 1,
          totalInConsideration: (profileSummary?.totalInConsideration || 0) + 1,
        };
        setProfileSummary(updatedProfileSummary as UserProfileSummary);
        setLocalApplyJobs((prev) => [...prev, quickApplyJob]);
        updateUserApplications([res]);
        player.seekTo(0);
        player.play();
        await onActionSuccess();
      }
    }
    setQuickApplyJob(null);
    setShowQuickApplyModal(false);
  };

  const canQuickApply = (jobId: number) => {
    return (
      !isAppliedJobsLoading &&
      !appliedJobs?.includes(jobId) &&
      !localApplyJobs.includes(jobId) &&
      !hasUserAppliedToJob(user, jobId)
    );
  };

  return (
    <SafeAreaView className={`relative flex-1 bg-white${isAuthenticated ? " pb-20" : ""}`}>
      <StatusBar hidden={true} />
      <View className="w-full items-center justify-center mb-4">
        <SearchBar placeholder="Search for Jobs..." onSubmit={handleSearchSubmit} />
      </View>
      {isAuthenticated && (
        <View className="m-4 my-2">
          <RecommendedJobsPreview
            recommendedJobs={recommendedJobs}
            isLoadingRecommended={isLoadingRecommended}
            isViewingRecommended={isViewingRecommended}
            handleViewAll={() => setIsViewRecommended(!isViewingRecommended)}
            handleBatchQuickApplySuccess={async (newApplications: Application[]) => {
              const newJobIds = newApplications.map((app) => app.jobId);
              setLocalApplyJobs((prev) => [...prev, ...newJobIds]);
              updateUserApplications(newApplications);
              player.seekTo(0);
              player.play();
              await onActionSuccess();
              setShowRecommendedJobsModalSuccess(true);
            }}
          />
        </View>
      )}
      <FilterStatus
        filterCount={filterCount}
        filters={filters}
        openFilters={openFilters}
        handleClearFilters={handleClearFilters}
      />
      {!isAuthLoading && showProfileCompleteReminder && (
        <CompleteProfileReminder onComplete={handleProfileComplete} onLater={handleProfileLater} />
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : (
        <FlatList
          className="w-full px-2"
          data={
            isViewingRecommended
              ? recommendedJobs?.map((item) => item.job)
              : jobs?.pages.flatMap((page) => page.jobs) || []
          } // Simulating multiple job listings
          renderItem={({ item, index }) => {
            let userApplication = hasUserAppliedToJob(user, item.id);
            let showFavorite = userApplication ? false : true;
            return (
              <JobListing
                key={index}
                job={item}
                showFavorite={showFavorite}
                showStatus={!showFavorite}
                appliedAt={userApplication && userApplication.appliedAt}
                status={userApplication && userApplication.status}
                canQuickApply={canQuickApply(item.id)}
                handleQuickApply={() => handleQuickApply(item.id, item.title, item.businessName)}
              />
            );
          }}
          onEndReached={() => {
            if (hasNextPage && !isViewingRecommended) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={() => {
            return isLoading ? <ActivityIndicator size="small" color="green" /> : null;
          }}
          ItemSeparatorComponent={() => <View className="divider" />}
        />
      )}
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
