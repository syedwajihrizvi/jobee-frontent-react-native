import ApplicationInfo from "@/components/ApplicationInfo";
import ApplyBottomSheet from "@/components/ApplyBottomSheet";
import BackBar from "@/components/BackBar";
import CompanyInformation from "@/components/CompanyInformation";
import ExpandableText from "@/components/ExpandableText";
import FavoriteCompany from "@/components/FavoriteCompany";
import FavoriteJob from "@/components/FavoriteJob";
import JobInfo from "@/components/JobInfo";
import ModalWithBg from "@/components/ModalWithBg";
import QuickApply from "@/components/QuickApply";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import ViewMore from "@/components/ViewMore";
import { sounds } from "@/constants";
import { addViewToJobs, applyToJob, checkJobMatchForUser } from "@/lib/jobEndpoints";
import { useCompany } from "@/lib/services/useCompany";
import { useJob } from "@/lib/services/useJobs";
import {
  formatDate,
  getEmploymentType,
  getJobLevel,
  getMatchConfig,
  getWorkArrangement,
  onActionSuccess,
} from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
import { Application, CreateApplication, User, UserDocument } from "@/type";
import { Feather, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JobDetails = () => {
  const { id: jobId } = useLocalSearchParams();
  const { user: authUser, isAuthenticated, isLoading: isLoadingUser } = useAuthStore();
  const { applications, setApplications, isLoadingApplications, setLastApplication, lastApplication } = useUserStore();
  const user = authUser as User | null;
  const { data: job, isLoading } = useJob(Number(jobId));
  const [jobApplication, setJobApplication] = useState<Application | null>(null);
  const {
    addAppliedJob,
    addViewForJob,
    addApplicationForJob,
    getTotalViewsForJobById,
    getTotalApplicationsForJobById,
  } = useUserJobsStore();
  const { data: company, isLoading: isLoadingCompany } = useCompany(job?.companyId ?? undefined);
  const [showMatchSignInModal, setShowMatchSignInModal] = useState(false);
  const [showJobInfoModal, setShowJobInfoModal] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const jobBottomRef = useRef<BottomSheet>(null);
  const companyBottomRef = useRef<BottomSheet>(null);
  const applyBottomRef = useRef<BottomSheet>(null);
  const viewApplicationBottomRef = useRef<BottomSheet>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const userHasResume = user && user.documents && user.documents.some((doc) => doc.documentType === "RESUME");
  const player = useAudioPlayer(sounds.popSound);

  useEffect(() => {
    if (!isLoadingApplications && applications) {
      const application = applications.find((app) => app.jobId === Number(jobId));
      setJobApplication(application || null);
    }
  }, [isLoadingApplications, applications, jobId]);

  useEffect(() => {
    addViewForJob(Number(jobId));
    const addView = async () => {
      await addViewToJobs(Number(jobId));
      console.log("Added view to job", jobId);
    };
    addView();
  }, [jobId]);

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

  const handleSubmitApplication = async (
    selectedResume: UserDocument | null,
    selectedCoverLetter: UserDocument | null
  ) => {
    if (!selectedResume) {
      Alert.alert("Please select a resume to proceeed.");
      return;
    }
    console.log("Submitting application with resume:", selectedResume, "and cover letter:", selectedCoverLetter);
    setIsSubmittingApplication(true);
    try {
      const applicationInfo: CreateApplication = {
        jobId: Number(jobId),
        resumeDocumentId: Number(selectedResume.id),
        coverLetterDocumentId: selectedCoverLetter ? Number(selectedCoverLetter.id) : undefined,
      };

      const res = await applyToJob(applicationInfo);
      if (res) {
        setShowSuccessModal(true);
        setLastApplication(res);
        addAppliedJob(res.job);
        addApplicationForJob(Number(jobId));
        Alert.alert("Application submitted successfully!");
        applyBottomRef.current?.close();
        player.seekTo(0);
        player.play();
        await onActionSuccess();
      }
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
    return ["60%"];
  };

  const handleCheckMatch = async () => {
    if (!isAuthenticated) {
      setShowMatchSignInModal(true);
      return;
    }
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
    const buttonWidth = jobApplication ? "w-full" : "w-1/2";
    if (isCheckingMatch) {
      return (
        <TouchableOpacity
          className={`bg-gray-400 rounded-xl px-2 py-3 items-center justify-center flex-row gap-2 mb-2 ${buttonWidth}`}
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
          className={`bg-emerald-500 rounded-xl px-2 py-3 items-center justify-center flex-row gap-2 mb-2 ${buttonWidth}`}
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
      <View className={`mb-2 ${buttonWidth}`}>
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
      </View>
    );
  };

  const getViews = () => {
    return getTotalViewsForJobById(Number(jobId)) || job?.views || 0;
  };

  const getApplications = () => {
    return getTotalApplicationsForJobById(Number(jobId)) || job?.applicationCount || 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative pb-20">
      <BackBar label="Job Details" />
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
              {job && <FavoriteJob job={job} />}
            </View>
            <View className="flex-row items-start justify-between mb-1">
              <View className="flex-1 mr-4">
                <Text className="font-quicksand-bold text-lg text-gray-900 leading-8 mb-2" numberOfLines={2}>
                  {job?.title}
                </Text>
                <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 mb-1">
                  <View className="flex-row items-center gap-1">
                    <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center">
                      <Feather name="eye" size={12} color="#3b82f6" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-blue-700">
                      {getViews()} {getViews() === 1 ? "view" : "views"}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                      <Feather name="users" size={12} color="#10b981" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-emerald-700">
                      {getApplications() === 0
                        ? "Be the first to apply"
                        : getApplications() === 1
                          ? "1 applicant"
                          : `${getApplications()} applications`}
                    </Text>
                  </View>
                  <View className="flex-row gap-1 items-center justify-center py-1">
                    <View className="w-6 h-6 bg-amber-100 rounded-full items-center justify-center">
                      <FontAwesome6 name="stairs" size={12} color="#f59e0b" />
                    </View>
                    <Text className="font-quicksand-semibold text-sm text-amber-700">{getJobLevel(job?.level)}</Text>
                  </View>
                  <View className="flex-row gap-1 items-center justify-center py-1">
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
                  <View key={index} className="bg-emerald-50 border border-green-200 px-3 py-1 mr-1 rounded-full">
                    <Text className="font-quicksand-medium text-xs text-green-700">{tag.name}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <View className="flex-row items-center justify-center gap-2">
              {renderJobMatchView()}
              {!jobApplication && <QuickApply job={job!} size="large" />}
            </View>
          </View>
          <View
            className="bg-white mx-4 mt-4 rounded-2xl p-6 border border-gray-100 gap-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="file-text" size={16} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-semibold text-lg text-gray-900">Job Description</Text>
            </View>
            <ExpandableText text={job?.description || ""} length={300} />
            <ViewMore
              label="AI Insights and More"
              onClick={() => setShowJobInfoModal(true)}
              icon={<Ionicons name="sparkles" size={16} color="#fbbf24" />}
            />
          </View>
          <View
            className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-6 border border-gray-100 gap-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                  <FontAwesome5 name="building" size={16} color="#8b5cf6" />
                </View>
                <Text className="font-quicksand-semibold text-lg text-gray-900">Company Overview</Text>
              </View>

              <FavoriteCompany company={company!} />
            </View>
            {isLoadingCompany ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#8b5cf6" />
              </View>
            ) : (
              <ExpandableText text={company?.description || ""} length={300} />
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
            className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
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
              <Text className="font-quicksand-bold text-md text-white">
                {jobApplication ? "View Application" : "Apply Now"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {isAuthenticated && jobApplication && !(jobApplication instanceof Error) && (
        <BottomSheet ref={viewApplicationBottomRef} index={-1} snapPoints={["40%"]} enablePanDownToClose>
          <BottomSheetView className="flex-1 bg-white">
            <ApplicationInfo applicationId={jobApplication.id} />
          </BottomSheetView>
        </BottomSheet>
      )}
      <BottomSheet ref={applyBottomRef} index={-1} snapPoints={calculateApplyButtonSnapPoints()} enablePanDownToClose>
        <BottomSheetView className="flex-1 bg-white">
          {isAuthenticated && user ? (
            <ApplyBottomSheet
              handleSubmitApplication={handleSubmitApplication}
              isSubmittingApplication={isSubmittingApplication}
              closeSheet={() => applyBottomRef.current?.close()}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-6">
              <View
                className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-6"
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
                  className="flex-1 bg-emerald-500 rounded-xl py-3 items-center"
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
      <ModalWithBg visible={showJobInfoModal} customHeight={0.9} customWidth={0.95}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Job Details</Text>
            <TouchableOpacity onPress={() => setShowJobInfoModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <JobInfo job={job!} />
        </View>
      </ModalWithBg>
      <ModalWithBg visible={showSuccessModal} customHeight={0.5} customWidth={0.8}>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center">
            <Feather name="check" size={28} color="white" />
          </View>

          <View className="items-center gap-1">
            <Text className="font-quicksand-bold text-lg text-gray-800">Applied Successfully!</Text>
            <Text className="font-quicksand-semibold text-sm text-gray-600 text-center">
              Applied to {job?.title} at {job?.businessName}. Check your dashboard for updates.
            </Text>
          </View>

          <RenderCompanyLogo logoUrl={job?.companyLogoUrl} size={12} />

          <TouchableOpacity
            className="bg-emerald-500 py-3 px-6 rounded-xl mt-4 w-full items-center justify-center"
            onPress={() => {
              setShowSuccessModal(false);
              const newApplication = {
                id: lastApplication?.id,
                appliedAt: lastApplication?.appliedAt,
                jobId: job?.id,
                status: lastApplication?.status,
              } as Application;
              setApplications([newApplication, ...applications]);
            }}
          >
            <Text className="font-quicksand-bold text-white text-base">Perfect Thanks!</Text>
          </TouchableOpacity>
        </View>
      </ModalWithBg>
      <Modal transparent animationType="fade" visible={showMatchSignInModal}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View
            style={{
              width: 300,
              height: 200,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              gap: 10,
            }}
          >
            <Text className="font-quicksand-bold text-xl">Sign in to use feature</Text>
            <Text className="font-quicksand-medium text-center">You need to be signed in to use this feature.</Text>
            <View className="flex flex-row items-center justify-center w-full gap-2">
              <TouchableOpacity
                className="apply-button w-1/2 items-center justify-center h-14"
                onPress={() => {
                  setShowMatchSignInModal(false);
                  router.push("/(auth)/sign-in");
                }}
              >
                <Text className="font-quicksand-semibold text-md text-white">Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="apply-button w-1/2 items-center justify-center h-14"
                onPress={() => setShowMatchSignInModal(false)}
              >
                <Text className="font-quicksand-semibold text-md text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JobDetails;
