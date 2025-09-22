import ApplicationInfo from "@/components/ApplicationInfo";
import ApplyBottomSheet from "@/components/ApplyBottomSheet";
import BackBar from "@/components/BackBar";
import CompanyInfo from "@/components/CompanyInfo";
import CompanyInformation from "@/components/CompanyInformation";
import FavoriteJob from "@/components/FavoriteJob";
import JobInfo from "@/components/JobInfo";
import ViewMore from "@/components/ViewMore";
import { sounds, UserDocumentType } from "@/constants";
import { applyToJob } from "@/lib/jobEndpoints";
import { useCompany } from "@/lib/services/useCompany";
import { useJob, useJobApplication } from "@/lib/services/useJobs";
import {
  getEmploymentType,
  getWorkArrangement,
  onActionSuccess,
} from "@/lib/utils";
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
  const { data: company, isLoading: isLoadingCompany } = useCompany(
    job?.companyId ?? undefined
  );
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
        <ScrollView className="w-full px-4 pt-4 mb-20">
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
                  {job?.location} · {getEmploymentType(job?.employmentType)} ·{" "}
                  {getWorkArrangement(job?.setting)}
                </Text>
                <Text className="font-quicksand-semibold text-sm">
                  {`$${job?.minSalary} - $${job?.maxSalary}`}
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
            <Text className="font-quicksand-semibold text-md">
              {/* {job?.description} */}
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Vero non
              at, numquam ipsum odio dolor voluptate laudantium fuga odit
              nostrum consectetur? Fugit nesciunt laudantium, inventore suscipit
              praesentium tempore nemo vitae sint, aliquid accusamus qui. Esse
              quo qui, veniam magnam obcaecati consequatur asperiores,
              dignissimos tempore at excepturi, facere dolore doloribus harum
              provident. Commodi cupiditate distinctio, sit illo iusto corrupti
              dolore atque. Architecto provident, excepturi labore autem ipsa
              facere ea cum animi eius, dolorem magni aperiam quas expedita
              voluptatibus! Quis, ipsum iusto?
            </Text>
            <ViewMore
              label="View More About Job"
              onClick={handleJobBottomOpen}
            />
            <View className="divider" />
            <View className="flex-col gap-2">
              <Text className="font-quicksand-bold text-2xl">
                Company Overview
              </Text>
              {isLoadingCompany ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-quicksand-semibold text-md">
                  {/* {company.description} */}
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Necessitatibus, asperiores quas! Odit rem nostrum veniam ea
                  laboriosam maiores minus tenetur, odio delectus consequatur
                  non repellendus inventore, distinctio necessitatibus magni,
                  vero unde doloribus! Eum, similique aperiam quae facere
                  cupiditate tenetur magnam! Quaerat odio numquam sit
                  consequuntur. Hic ab sapiente dignissimos architecto?
                </Text>
              )}
            </View>
            <ViewMore
              label="View More About Company"
              onClick={handleCompanyBottomOpen}
            />
          </View>
        </ScrollView>
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
        snapPoints={["20%", "30%"]}
        enablePanDownToClose
      >
        <BottomSheetView className="flex-1 bg-white">
          {isLoading ? (
            <ActivityIndicator />
          ) : job ? (
            <JobInfo job={job} />
          ) : null}
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet
        ref={companyBottomRef}
        index={-1}
        snapPoints={["20%", "30%"]}
        enablePanDownToClose
      >
        <BottomSheetView className="flex-1 bg-white">
          {isLoadingCompany ? (
            <ActivityIndicator />
          ) : company ? (
            <CompanyInfo company={company} />
          ) : null}
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
