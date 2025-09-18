import ApplicationInfo from "@/components/ApplicationInfo";
import ApplyBottomSheet from "@/components/ApplyBottomSheet";
import BackBar from "@/components/BackBar";
import BoldLabeledText from "@/components/BoldLabeledText";
import CompanyInfo from "@/components/CompanyInfo";
import CompanyInformation from "@/components/CompanyInformation";
import FavoriteJob from "@/components/FavoriteJob";
import JobInfo from "@/components/JobInfo";
import ViewMore from "@/components/ViewMore";
import { sounds, UserDocumentType } from "@/constants";
import { applyToJob } from "@/lib/jobEndpoints";
import { useJob, useJobApplication } from "@/lib/services/useJobs";
import { getEmploymentType, onActionSuccess } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { CreateApplication, User, UserDocument } from "@/type";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JobDetails = () => {
  const { id: jobId } = useLocalSearchParams();
  const {
    user: authUser,
    isAuthenticated,
    isLoading: isLoadingUser,
  } = useAuthStore();
  const { data: job, isLoading } = useJob(Number(jobId));
  const { data: jobApplication, isLoading: isLoadingJobApplication } =
    useJobApplication(Number(jobId));
  const [openResumeDropdown, setOpenResumeDropdown] = useState(false);
  const [openCoverLetterDropdown, setOpenCoverLetterDropdown] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(
    null
  );
  const jobBottomRef = useRef<BottomSheet>(null);
  const companyBottomRef = useRef<BottomSheet>(null);
  const applyBottomRef = useRef<BottomSheet>(null);
  const viewApplicationBottomRef = useRef<BottomSheet>(null);
  const [userDocuments, setUserDocuments] = useState<{
    RESUMES: UserDocument[];
    COVER_LETTERS: UserDocument[];
  } | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const user = authUser as User | null;
  const userHasResume =
    user &&
    user.documents &&
    user.documents.some((doc) => doc.documentType === "RESUME");
  const queryClient = useQueryClient();
  const player = useAudioPlayer(sounds.popSound);

  useEffect(() => {
    if (user && (user as User).documents) {
      const resumes = (user as User).documents.filter(
        (doc) => doc.documentType === UserDocumentType.RESUME
      );
      const coverLetters = (user as User).documents.filter(
        (doc) => doc.documentType === UserDocumentType.COVER_LETTER
      );
      setUserDocuments({
        RESUMES: resumes,
        COVER_LETTERS: coverLetters,
      });
      if (resumes.length > 0) {
        setSelectedResume(String(resumes[0].id));
      }
    }
  }, [isLoadingUser, user]);

  const handleJobBottomOpen = () => {
    companyBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    jobBottomRef.current?.expand();
  };

  const handleCompanyBottomOpen = () => {
    jobBottomRef.current?.close();
    applyBottomRef.current?.close();
    viewApplicationBottomRef.current?.close();
    companyBottomRef.current?.expand();
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
        coverLetterDocumentId: selectedCoverLetter
          ? Number(selectedCoverLetter)
          : undefined,
      };

      await applyToJob(applicationInfo);
      queryClient.invalidateQueries({ queryKey: ["jobs", "applications"] });
      Alert.alert("Application submitted successfully!");
      applyBottomRef.current?.close();
      player.seekTo(0);
      player.play();
      await onActionSuccess();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert("Failed to submit application. Please try again.");
      return;
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const calculateApplyButtonSnapPoints = () => {
    if (!isAuthenticated) return ["20%"];
    if (!userHasResume) return ["32%"];
    return ["50%"];
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <BackBar label="Job Details" />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="w-full p-4">
          <View>
            <View className="w-full flex-row items-center justify-between">
              <CompanyInformation company={job?.businessName!} />
              <FavoriteJob jobId={job?.id!} />
            </View>
            <View className="flex-row items-start justify-between">
              <View className="w-2/3">
                <Text className="font-quicksand-bold text-2xl">
                  {job?.title}
                </Text>
                <Text className="font-quicksand-semibold text-sm">
                  {job?.location}
                </Text>
              </View>
              {isAuthenticated && (
                <TouchableOpacity className="bg-green-500 rounded-full px-4 py-2 flex items-center justify-center">
                  <Text className={`font-quicksand-semibold text-sm`}>
                    Check Match
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              className="flex-row flex-wrap gap-2 mt-2"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {job?.tags?.map((tag, index) => (
                <Text key={index} className="badge badge--green text-sm mx-1">
                  {tag.name}
                </Text>
              ))}
            </ScrollView>
          </View>
          <View className="divider" />
          <View className="flex-col gap-1">
            <Text className="font-quicksand-bold text-2xl">
              Job Description
            </Text>
            <Text className="font-quicksand-semibold text-base">
              {job?.description}
            </Text>
            <View className="mt-2 flex-col gap-2">
              <BoldLabeledText label="Location" value={job?.location!} />
              <BoldLabeledText
                label="Salary"
                value={`$${job?.minSalary} - $${job?.maxSalary} per year`}
              />
              <BoldLabeledText
                label="Experience"
                value={job?.experience.toLocaleString()!}
              />
              <BoldLabeledText
                label="Employment Type"
                value={getEmploymentType(job?.employmentType)!}
              />
              <BoldLabeledText label="Posted On" value="August 1st 2025" />
              <BoldLabeledText label="Apply By" value="August 31st 2025" />
            </View>
            <ViewMore
              label="View More About Job"
              onClick={handleJobBottomOpen}
            />
            <View className="divider" />
            <View className="flex-col gap-2">
              <Text className="font-quicksand-bold text-2xl">
                Company Overview
              </Text>
              <BoldLabeledText
                label="Business Name"
                value={job?.businessName!}
              />
              <BoldLabeledText label="Employee Count" value={"10000+"} />
              <BoldLabeledText label="Founded" value={"2005"} />
              <BoldLabeledText
                label="Industry"
                value={"Information Technology and Services"}
              />
              <BoldLabeledText label="Website" value={"www.example.com"} />
            </View>
            <ViewMore
              label="View More About Company"
              onClick={handleCompanyBottomOpen}
            />
            <View className="divider" />
          </View>
        </View>
      )}
      <View className="w-full absolute bottom-0 bg-slate-100 p-4 pb-10 flex-row gap-2 items-center justify-center">
        <TouchableOpacity
          className="btn btn--green w-3/5 h-14 items-center"
          onPress={
            jobApplication
              ? handleViewApplicationBottomOpen
              : handleApplyBottomOpen
          }
        >
          <Text className="font-quicksand-semibold text-md">
            {jobApplication ? "View Application Status" : "Apply Now"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="favorite-button h-14 w-1/6 items-center justify-center">
          <FavoriteJob jobId={job?.id!} />
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={jobBottomRef}
        index={-1}
        snapPoints={["40%", "50%"]}
        enablePanDownToClose
      >
        <BottomSheetView className="flex-1 bg-white">
          <JobInfo />
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet
        ref={companyBottomRef}
        index={-1}
        snapPoints={["40%", "50%"]}
        enablePanDownToClose
      >
        <BottomSheetView className="flex-1 bg-white">
          <CompanyInfo />
        </BottomSheetView>
      </BottomSheet>
      {isAuthenticated &&
        !isLoadingJobApplication &&
        jobApplication &&
        !(jobApplication instanceof Error) && (
          <BottomSheet
            ref={viewApplicationBottomRef}
            index={-1}
            snapPoints={["40%"]}
            enablePanDownToClose
          >
            <BottomSheetView className="flex-1 bg-white">
              <ApplicationInfo job={job!} application={jobApplication!} />
            </BottomSheetView>
          </BottomSheet>
        )}
      <BottomSheet
        ref={applyBottomRef}
        index={-1}
        snapPoints={calculateApplyButtonSnapPoints()}
        enablePanDownToClose
      >
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
            <View className="flex flex-col justify-center items-center px-4 w-full gap-2">
              <Text className="font-quicksand-bold text-xl">
                Sign up or login to get started
              </Text>
              <View className="flex flex-row gap-2">
                <TouchableOpacity
                  className="btn btn--green w-1/2"
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  <Text>Create an Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="btn btn--green w-1/2"
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  <Text>Sign In</Text>
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
