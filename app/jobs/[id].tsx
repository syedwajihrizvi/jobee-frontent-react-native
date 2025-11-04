import ApplicationInfo from "@/components/ApplicationInfo";
import ApplyBottomSheet from "@/components/ApplyBottomSheet";
import BackBar from "@/components/BackBar";
import CompanyInformation from "@/components/CompanyInformation";
import ExpandableText from "@/components/ExpandableText";
import FavoriteJob from "@/components/FavoriteJob";
import JobInfo from "@/components/JobInfo";
import ViewMore from "@/components/ViewMore";
import { sounds, UserDocumentType } from "@/constants";
import { addViewToJobs, applyToJob, checkJobMatchForUser } from "@/lib/jobEndpoints";
import { useCompany } from "@/lib/services/useCompany";
import { useJob, useJobsByUserApplications } from "@/lib/services/useJobs";
import { toggleFavoriteCompany } from "@/lib/updateUserProfile";
import {
  formatDate,
  getEmploymentType,
  getJobLevel,
  getMatchConfig,
  getWorkArrangement,
  onActionSuccess,
} from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useProfileSummaryStore from "@/store/profile-summary.store";
import { Company, CreateApplication, Job, User, UserDocument } from "@/type";
import { Feather, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JobDetails = () => {
  const { id: jobId } = useLocalSearchParams();
  const { user: authUser, isAuthenticated, isLoading: isLoadingUser } = useAuthStore();
  const user = authUser as User | null;
  const { profileSummary } = useProfileSummaryStore();
  const { data: job, isLoading } = useJob(Number(jobId));
  const { data: jobApplications, isLoading: isLoadingJobApplications } = useJobsByUserApplications(user?.id);
  const [jobApplication, setJobApplication] = useState<{
    job: Job;
    status: string;
    appliedAt: string;
    applicationId: number;
  } | null>(null);
  const { data: company, isLoading: isLoadingCompany } = useCompany(job?.companyId ?? undefined);
  const [openResumeDropdown, setOpenResumeDropdown] = useState(false);
  const [openCoverLetterDropdown, setOpenCoverLetterDropdown] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(null);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);
  const jobBottomRef = useRef<BottomSheet>(null);
  const companyBottomRef = useRef<BottomSheet>(null);
  const applyBottomRef = useRef<BottomSheet>(null);
  const viewApplicationBottomRef = useRef<BottomSheet>(null);
  const [userDocuments, setUserDocuments] = useState<{
    RESUMES: UserDocument[];
    COVER_LETTERS: UserDocument[];
  } | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const userHasResume = user && user.documents && user.documents.some((doc) => doc.documentType === "RESUME");
  const queryClient = useQueryClient();
  const player = useAudioPlayer(sounds.popSound);

  useEffect(() => {
    if (!isLoadingJobApplications && jobApplications) {
      // find the application for the current job
      const application = jobApplications.find((app) => app.job.id === Number(jobId));
      setJobApplication(application || null);
    }
  }, [isLoadingJobApplications, jobApplications, jobId]);
  useEffect(() => {
    const addView = async () => {
      await addViewToJobs(Number(jobId));
      console.log("Added view to job", jobId);
    };
    addView();
  }, [jobId]);

  useEffect(() => {
    if (user && (user as User).documents) {
      const resumes = (user as User).documents.filter((doc) => doc.documentType === UserDocumentType.RESUME);
      const coverLetters = (user as User).documents.filter((doc) => doc.documentType === UserDocumentType.COVER_LETTER);
      setUserDocuments({
        RESUMES: resumes,
        COVER_LETTERS: coverLetters,
      });
      if (resumes.length > 0) {
        setSelectedResume(String(resumes[0].id));
      }
    }
  }, [isLoadingUser, user]);

  const checkIfCompanyIsFavorited = (companyId: number) => {
    if (!profileSummary) return false;
    return profileSummary?.favoriteCompanies.some((company) => company.id === companyId);
  };
  const handleFavoriteCompany = async (company: Company) => {
    try {
      const result = await toggleFavoriteCompany(Number(company.id));
      console.log("Toggling favorite company:", result);
      if (result) {
        const currFavorites = profileSummary?.favoriteCompanies || [];
        const index = currFavorites.findIndex((c) => c.id === Number(company.id));
        if (index > -1) {
          const newFavorites = currFavorites.filter((c) => c.id !== Number(company.id));
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: newFavorites,
          });
        } else {
          useProfileSummaryStore.getState().setProfileSummary({
            ...profileSummary!,
            favoriteCompanies: [company, ...currFavorites],
          });
        }
        console.log("Successfully toggled favorite company");
      }
    } catch (error) {
      console.error("Error toggling favorite company:", error);
    }
  };

  const handleJobBottomOpen = () => {
    companyBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    jobBottomRef.current?.expand();
  };

  const handleApplyBottomOpen = () => {
    companyBottomRef.current?.close();
    jobBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    applyBottomRef.current?.expand();
  };

  const handleViewApplicationBottomOpen = () => {
    companyBottomRef.current?.close();
    jobBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.expand();
  };

  const handleSubmitApplication = async () => {
    if (!selectedResume) {
      Alert.alert("Please select a resume to proceeed.");
      return;
    }
    setIsSubmittingApplication(true);
    try {
      const applicationInfo: CreateApplication = {
        jobId: Number(jobId),
        resumeDocumentId: Number(selectedResume),
        coverLetterDocumentId: selectedCoverLetter ? Number(selectedCoverLetter) : undefined,
      };

      await applyToJob(applicationInfo);
      queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
      Alert.alert("Application submitted successfully!");
      applyBottomRef.current?.close();
      player.seekTo(0);
      player.play();
      await onActionSuccess();
    } catch (error) {
      Alert.alert("Failed to submit application. Please try again.");
      return;
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const calculateApplyButtonSnapPoints = () => {
    if (!isAuthenticated) return ["30%"];
    if (!userHasResume) return ["32%"];
    return ["50%"];
  };

  const handleCheckMatch = async () => {
    try {
      setIsCheckingMatch(true);
      const res = await checkJobMatchForUser(Number(jobId));
      if (res) {
        console.log("Job match result:", res);
        setMatchPercentage(res.matchPercentage);
      }
    } catch (error) {
      console.error("Error checking job match:", error);
    } finally {
      setIsCheckingMatch(false);
    }
  };

  const renderJobMatchView = () => {
    if (isCheckingMatch) {
      return (
        <TouchableOpacity
          className="bg-gray-400 rounded-xl px-2 py-3 items-center justify-center flex-row gap-2 mb-2"
          style={{
            shadowColor: "#6b7280",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
          disabled
        >
          <ActivityIndicator size="small" color="white" />
          <Text className="font-quicksand-bold text-sm text-white">Analyzing Match...</Text>
        </TouchableOpacity>
      );
    }
    if (matchPercentage === null) {
      return (
        <TouchableOpacity
          className="bg-emerald-500 rounded-xl px-2 py-3 items-center justify-center flex-row gap-2 mb-2"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
          activeOpacity={0.8}
          onPress={handleCheckMatch}
        >
          <Text className="font-quicksand-bold text-sm text-white">Check Match</Text>
          <Feather name="target" size={12} color="white" />
        </TouchableOpacity>
      );
    }
    const config = getMatchConfig(matchPercentage);
    return (
      <View className="mb-2">
        <View
          className={`${config.bgColor} rounded-xl px-2 py-3 items-center justify-center flex-row gap-2`}
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Text className="font-quicksand-bold text-sm text-white">{matchPercentage}% Match</Text>
          <Feather name={config.icon as React.ComponentProps<typeof Feather>["name"]} size={12} color="white" />
        </View>
        <TouchableOpacity
          className="bg-emerald-500 border border-gray-200 rounded-xl px-3 py-2 mt-2 flex-row items-center justify-center gap-2"
          style={{
            shadowColor: "#6b7280",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          activeOpacity={0.8}
          onPress={handleCheckMatch}
        >
          <Feather name="refresh-cw" size={12} color="white" />
          <Text className="font-quicksand-semibold text-xs text-white">Re-analyze Match</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative">
      <BackBar label="Job Details" />
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
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View
            className="bg-white mx-4 mt-2 rounded-2xl p-3 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <CompanyInformation companyName={job?.businessName!} companyLogoUrl={job?.companyLogoUrl!} />
              </View>
              <FavoriteJob jobId={job?.id!} />
            </View>
            <View className="flex-row items-start justify-between mb-1">
              <View className="flex-1 mr-4">
                <Text className="font-quicksand-bold text-lg text-gray-900 leading-8 mb-2">{job?.title}</Text>
                <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 mb-1">
                  <View className="flex-row items-center gap-1">
                    <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center">
                      <Feather name="eye" size={12} color="#3b82f6" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-blue-700">
                      {job?.views || 0} {(job?.views || 0) === 1 ? "view" : "views"}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                      <Feather name="users" size={12} color="#10b981" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-emerald-700">
                      {job?.applicants === 0
                        ? "Be the first to apply"
                        : job?.applicants === 1
                          ? "1 applicant"
                          : `${job?.applicants} applications`}
                    </Text>
                  </View>
                  <View className="flex-row gap-1 items-center justify-center py-1">
                    <View className="w-6 h-6 bg-amber-100 rounded-full items-center justify-center">
                      <FontAwesome6 name="stairs" size={12} color="#f59e0b" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-amber-700">{getJobLevel(job?.level)}</Text>
                  </View>
                  <View className="flex-row gap-1 items-center justify-center px-3 py-1">
                    <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center">
                      <FontAwesome6 name="building" size={12} color="#8b5cf6" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-purple-700">{job?.department}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2 mb-2 flex-wrap">
                  <View className="flex-row items-center gap-1">
                    <Feather name="map-pin" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">{job?.location}</Text>
                  </View>
                  <View className="w-1 h-1 bg-gray-400 rounded-full" />
                  <View className="flex-row items-center gap-1">
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {getEmploymentType(job?.employmentType)}
                    </Text>
                  </View>
                  <View className="w-1 h-1 bg-gray-400 rounded-full" />
                  <View className="flex-row items-center gap-1">
                    <Feather name="home" size={14} color="#6b7280" />
                    <Text className="font-quicksand-medium text-sm text-gray-600">
                      {getWorkArrangement(job?.setting)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-quicksand-bold text-lg text-emerald-600">
                    ${job?.minSalary?.toLocaleString()} - ${job?.maxSalary?.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row gap-3 mb-2">
              <View className="flex-1 bg-gray-50 rounded-xl p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Feather name="calendar" size={10} color="#6b7280" />
                  <Text className="font-quicksand-medium text-xs text-gray-600">Posted</Text>
                </View>
                <Text className="font-quicksand-bold text-xs text-gray-900">{formatDate(job?.createdAt!)}</Text>
              </View>

              <View className="flex-1 bg-red-50 rounded-xl p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Feather name="clock" size={12} color="#ef4444" />
                  <Text className="font-quicksand-medium text-xs text-red-600">Deadline</Text>
                </View>
                <Text className="font-quicksand-bold text-xs text-red-700">{formatDate(job?.appDeadline!)}</Text>
              </View>
            </View>
            {job?.tags && job.tags.length > 0 && (
              <ScrollView
                className="flex-row gap-2"
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20, marginBottom: 8 }}
              >
                {job.tags.map((tag, index) => (
                  <View key={index} className="bg-green-50 border border-green-200 px-3 py-1 mr-1 rounded-full">
                    <Text className="font-quicksand-medium text-xs text-green-700">{tag.name}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            {isAuthenticated && renderJobMatchView()}
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
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="file-text" size={16} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-semibold text-lg text-gray-900">Job Description</Text>
            </View>
            <ExpandableText text={job?.description || ""} />
            <ViewMore label="View More About Job" onClick={handleJobBottomOpen} />
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
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                  <FontAwesome5 name="building" size={16} color="#8b5cf6" />
                </View>
                <Text className="font-quicksand-semibold text-lg text-gray-900">Company Overview</Text>
              </View>

              <TouchableOpacity
                className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                onPress={() => handleFavoriteCompany(company!)}
                activeOpacity={0.7}
              >
                <FontAwesome5 name="heart" size={16} color="#ef4444" solid={checkIfCompanyIsFavorited(company?.id!)} />
              </TouchableOpacity>
            </View>
            {isLoadingCompany ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#8b5cf6" />
              </View>
            ) : (
              <ExpandableText text={company?.description || ""} />
            )}
            <ViewMore label="View More About Company" onClick={() => router.push(`/companies/${company?.id}`)} />
          </View>
          <View className="flex-1" />
        </ScrollView>
      )}
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
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="flex-1 bg-green-500 rounded-xl py-4 items-center justify-center"
            style={{
              shadowColor: "#6366f1",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={jobApplication ? handleViewApplicationBottomOpen : handleApplyBottomOpen}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              <Feather name={jobApplication ? "eye" : "send"} size={18} color="white" />
              <Text className="font-quicksand-bold text-base text-white">
                {jobApplication ? "View Application" : "Apply Now"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-100 rounded-xl p-1 border border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <FavoriteJob jobId={job?.id!} />
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheet ref={jobBottomRef} index={-1} snapPoints={["60%", "65%"]} enablePanDownToClose>
        <BottomSheetView className="flex-1 bg-white">
          {isLoading ? <ActivityIndicator /> : job ? <JobInfo job={job} /> : null}
        </BottomSheetView>
      </BottomSheet>
      {isAuthenticated && jobApplication && !(jobApplication instanceof Error) && (
        <BottomSheet ref={viewApplicationBottomRef} index={-1} snapPoints={["40%"]} enablePanDownToClose>
          <BottomSheetView className="flex-1 bg-white">
            <ApplicationInfo applicationId={jobApplication.applicationId} />
          </BottomSheetView>
        </BottomSheet>
      )}
      <BottomSheet ref={applyBottomRef} index={-1} snapPoints={calculateApplyButtonSnapPoints()} enablePanDownToClose>
        <BottomSheetView className="flex-1 bg-white">
          {isAuthenticated && user ? (
            <ApplyBottomSheet
              userHasResume={!!userHasResume}
              selectedResume={selectedResume}
              setSelectedResume={setSelectedResume}
              openResumeDropdown={openResumeDropdown}
              setOpenResumeDropdown={setOpenResumeDropdown}
              selectedCoverLetter={selectedCoverLetter}
              setSelectedCoverLetter={setSelectedCoverLetter}
              openCoverLetterDropdown={openCoverLetterDropdown}
              setOpenCoverLetterDropdown={setOpenCoverLetterDropdown}
              userDocuments={userDocuments}
              isSubmittingApplication={isSubmittingApplication}
              handleSubmitApplication={handleSubmitApplication}
              closeSheet={() => applyBottomRef.current?.close()}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-6">
              <View
                className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-6"
                style={{
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="user-plus" size={24} color="#21c48c" />
              </View>

              <Text className="font-quicksand-bold text-xl text-gray-800 text-center mb-2">
                Sign up or login to get started
              </Text>
              <Text className="font-quicksand-medium text-sm text-gray-600 text-center mb-6">
                Create an account to apply for this position
              </Text>

              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => router.push("/(auth)/sign-in")}
                  activeOpacity={0.8}
                >
                  <Text className="font-quicksand-bold text-white">Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-white border-2 border-green-500 rounded-xl py-3 items-center"
                  onPress={() => router.push("/(auth)/sign-in")}
                  activeOpacity={0.7}
                >
                  <Text className="font-quicksand-bold text-green-500">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default JobDetails;
