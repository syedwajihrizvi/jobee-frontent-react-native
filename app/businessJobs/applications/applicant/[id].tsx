import ApplicantSection from "@/components/ApplicantSection";
import BackBar from "@/components/BackBar";
import CollapsibleSection from "@/components/CollapsibleSection";
import ContactCandidate from "@/components/ContactCandidate";
import DocumentItem from "@/components/DocumentItem";
import DocumentModal from "@/components/DocumentModal";
import DocumentSection from "@/components/DocumentSection";
import ExpandableText from "@/components/ExpandableText";
import ModalWithBg from "@/components/ModalWithBg";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import UserVideoIntro from "@/components/UserVideoIntro";
import { shortListCandidate, unshortListCandidate } from "@/lib/jobEndpoints";
import { getS3VideoIntroUrl } from "@/lib/s3Urls";
import { updateApplicationStatus } from "@/lib/services/applicationEndpoints";
import { useApplicant } from "@/lib/services/useProfile";
import { addViewToProfile } from "@/lib/updateUserProfile";
import { getApplicationStatusLabel } from "@/lib/utils";
import useApplicationStore from "@/store/applications.store";
import useAuthStore from "@/store/auth.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import { BusinessUser, User, UserDocument } from "@/type";
import { Feather, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ApplicantForBusiness = () => {
  const queryClient = useQueryClient();
  const { id, interviewId } = useLocalSearchParams();
  const { user: authUser } = useAuthStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const {
    addToShortListedApplications,
    removeFromShortListedApplications,
    isCandidateShortListed,
    setApplicationStatus,
    getApplicationStatus,
  } = useApplicationStore();
  const { decrementPendingApplicationsForJob } = useBusinessJobsStore();
  const { data: applicationData, isLoading } = useApplicant(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "documents">("overview");
  const [activeExperience, setActiveExperience] = useState<"work" | "education" | "projects" | "skills" | null>(null);
  const [application, setApplication] = useState(applicationData);
  const { userProfile } = application || {};
  const [isUpdatingReject, setIsUpdatingReject] = useState(false);
  const [makingShortListRequest, setMakingShortListRequest] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | undefined>();
  const [userDocuments, setUserDocuments] = useState<{
    transcripts: UserDocument[];
    recommendationLetters: UserDocument[];
    certificates: UserDocument[];
  }>({ transcripts: [], recommendationLetters: [], certificates: [] });

  const user = authUser as BusinessUser | null;
  const isShortListed = isCandidateShortListed(Number(application?.jobId), Number(application?.id));
  const applicationStatus = getApplicationStatus(Number(application?.id)) || application?.status;

  useEffect(() => {
    if (applicationData && !isLoading) {
      const { userDocuments } = applicationData;
      const transcripts = userDocuments.filter((doc) => doc.documentType === "TRANSCRIPT");
      const recommendationLetters = userDocuments.filter((doc) => doc.documentType === "RECOMMENDATION");
      const certificates = userDocuments.filter((doc) => doc.documentType === "CERTIFICATE");
      setUserDocuments({ transcripts, recommendationLetters, certificates });
      setApplication(applicationData);
    }
  }, [applicationData, isLoading]);

  useEffect(() => {
    const addProfileView = async () => {
      await addViewToProfile(Number(application?.userProfile.id));
    };
    if (application?.userProfile.id) addProfileView();
  }, [application]);

  const handleRejectCandidate = async () => {
    Alert.alert("Confirm Rejection", "Are you sure you want to reject this candidate? This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          setShowActionsModal(false);
        },
      },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          setIsUpdatingReject(true);
          try {
            const res = await updateApplicationStatus(Number(application?.id), "REJECTED");
            if (res) {
              Alert.alert("Candidate Rejected", "The candidate has been rejected successfully.");
              setApplication((prev) => (prev ? { ...prev, status: "REJECTED" } : prev));
              setApplicationStatus(Number(application?.jobId), Number(application?.id), "REJECTED");
              decrementPendingApplicationsForJob(Number(application?.jobId));
              queryClient.invalidateQueries({
                queryKey: ["applicant", Number(application?.id)],
              });
            }
          } catch (error) {
            console.log("Error rejecting candidate: ", error);
          } finally {
            setIsUpdatingReject(false);
            setShowActionsModal(false);
          }
        },
      },
    ]);
  };

  const handleShortList = async () => {
    const jobId = Number(application?.jobId);
    const applicationId = Number(id);
    if (!application) return;
    setMakingShortListRequest(true);
    try {
      let result;
      if (isShortListed) {
        result = await unshortListCandidate({ applicationId });
      } else {
        result = await shortListCandidate({ applicationId });
      }
      if (result) {
        Alert.alert("Success", `Candidate ${isShortListed ? "unshortlisted" : "shortlisted"} successfully.`);
        if (!isShortListed) {
          addToShortListedApplications(jobId, applicationId);
        } else {
          removeFromShortListedApplications(jobId, applicationId);
        }
      } else {
        Alert.alert("Error", "Failed to add candidate to shortlist.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add candidate to shortlist.");
    } finally {
      setMakingShortListRequest(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "experience":
        return <ExperienceTab />;
      case "documents":
        return <DocumentsTab />;
    }
  };

  const OverviewTab = () => (
    <View className="py-4 gap-4 pb-20">
      <View className="bg-white rounded-xl p-4 border border-gray-100">
        <Text className="font-quicksand-bold text-md text-gray-900">Professional Summary</Text>
        <ExpandableText text={userProfile?.summary || "No Profile Summary Provided"} length={150} />
      </View>
      <View className="bg-white rounded-xl p-4 border border-gray-100">
        <Text className="font-quicksand-bold text-md text-gray-900 mb-3">Top Skills</Text>
        <View className="flex-row flex-wrap gap-2">
          {userProfile?.skills?.slice(0, 10).map((skill) => (
            <View key={skill.id} className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <Text className="font-quicksand-medium text-xs text-emerald-700">{skill.skill.name}</Text>
            </View>
          ))}
          {userProfile?.skills && userProfile.skills.length > 10 && (
            <TouchableOpacity
              className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-full"
              onPress={() => setActiveTab("experience")}
            >
              <Text className="font-quicksand-medium text-xs text-gray-600">
                +{userProfile.skills.length - 10} more
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {userProfile?.videoIntroUrl && (
        <View className="bg-white rounded-xl p-4 border border-gray-100 mb-10">
          <Text className="font-quicksand-bold text-md text-gray-900 mb-3">Video Introduction</Text>
          <UserVideoIntro videoSource={getS3VideoIntroUrl(userProfile.videoIntroUrl)} />
        </View>
      )}
    </View>
  );

  const ExperienceTab = () => (
    <View className="py-4 gap-4 pb-20">
      <CollapsibleSection
        title="Skills"
        icon={<Ionicons name="bulb" size={16} color="#10b981" />}
        titleSize="text-md"
        isOpen={activeExperience === "skills"}
        onToggle={() => setActiveExperience(activeExperience === "skills" ? null : "skills")}
      >
        <ApplicantSection
          items={userProfile?.skills || []}
          emptyIcon={<Ionicons name="bulb" size={24} color="#6b7280" />}
          emptyMessage="No skills added"
        >
          <View className="flex-row flex-wrap gap-2">
            {userProfile?.skills.map((skill) => (
              <View
                key={skill.id}
                className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text className="text-emerald-700 font-quicksand-semibold text-xs">{skill.skill.name}</Text>
              </View>
            ))}
          </View>
        </ApplicantSection>
      </CollapsibleSection>
      <CollapsibleSection
        title="Work Experience"
        titleSize="text-md"
        icon={<FontAwesome5 name="briefcase" size={16} color="#10b981" />}
        isOpen={activeExperience === "work"}
        onToggle={() => setActiveExperience(activeExperience === "work" ? null : "work")}
      >
        <ApplicantSection
          items={userProfile?.experiences || []}
          emptyIcon={<FontAwesome5 name="briefcase" size={24} color="#6b7280" />}
          emptyMessage="No work experience added"
        >
          <View className="gap-3">
            {userProfile?.experiences.map((exp) => (
              <View
                key={exp.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text className="font-quicksand-bold text-sm text-gray-900">{exp.title}</Text>
                <Text className="font-quicksand-semibold text-sm text-emerald-700">{exp.company}</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  {exp.from} - {exp.to || "Present"}
                </Text>
                <ExpandableText text={exp.description} length={200} />
              </View>
            ))}
          </View>
        </ApplicantSection>
      </CollapsibleSection>
      <CollapsibleSection
        title="Education"
        titleSize="text-md"
        icon={<FontAwesome name="university" size={16} color="#10b981" />}
        isOpen={activeExperience === "education"}
        onToggle={() => setActiveExperience(activeExperience === "education" ? null : "education")}
      >
        <ApplicantSection
          items={userProfile?.education || []}
          emptyIcon={<FontAwesome name="university" size={24} color="#6b7280" />}
          emptyMessage="No education details added"
        >
          <View className="gap-3">
            {userProfile?.education.map((edu) => (
              <View
                key={edu.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text className="font-quicksand-bold text-sm text-gray-900">{edu.degree}</Text>
                <Text className="font-quicksand-semibold text-sm text-emerald-700">{edu.institution}</Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">
                  {edu.fromYear} - {edu.toYear || "Present"}
                </Text>
              </View>
            ))}
          </View>
        </ApplicantSection>
      </CollapsibleSection>
      <CollapsibleSection
        title="Projects"
        titleSize="text-md"
        icon={<FontAwesome name="folder" size={16} color="#10b981" />}
        isOpen={activeExperience === "projects"}
        onToggle={() => setActiveExperience(activeExperience === "projects" ? null : "projects")}
      >
        <ApplicantSection
          items={userProfile?.projects || []}
          emptyIcon={<Feather name="folder" size={24} color="#6b7280" />}
          emptyMessage="No projects added"
        >
          <View className="gap-3">
            <View className="gap-3">
              {userProfile?.projects.map((project) => (
                <View
                  key={project.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text className="font-quicksand-bold text-md text-gray-900">{project.name}</Text>
                  {project.link && (
                    <Text className="font-quicksand-semibold text-sm text-emerald-600">{project.link}</Text>
                  )}
                  {project.yearCompleted && (
                    <Text className="font-quicksand-medium text-sm text-gray-600">{project.yearCompleted}</Text>
                  )}
                  <ExpandableText text={project.description} length={200} />
                </View>
              ))}
            </View>
          </View>
        </ApplicantSection>
      </CollapsibleSection>
    </View>
  );

  const DocumentsTab = () => (
    <View className="py-4 gap-4 pb-20">
      {/* Resume & Cover Letter */}
      <View className="bg-white rounded-xl p-4 border border-gray-100">
        <Text className="font-quicksand-bold text-md text-gray-900 mb-3">Application Documents</Text>
        <View className="flex-row gap-3">
          {application?.resumeDocument && (
            <DocumentItem
              document={application?.resumeDocument}
              customAction={() => {}}
              customTitle="Resume"
              canEdit={false}
              otherPartyName={`${userProfile?.firstName} ${userProfile?.lastName}`}
              canDownload={true}
              canEmail={true}
            />
          )}
          {application?.coverLetterDocument && (
            <DocumentItem
              document={application?.coverLetterDocument}
              customAction={() => {}}
              customTitle="Cover Letter"
              canEdit={false}
              otherPartyName={`${userProfile?.firstName} ${userProfile?.lastName}`}
              canDownload={true}
              canEmail={true}
            />
          )}
        </View>
      </View>

      {(userDocuments.transcripts.length > 0 ||
        userDocuments.recommendationLetters.length > 0 ||
        userDocuments.certificates.length > 0) && (
        <View className="rounded-xl gap-2 pb-10">
          <Text className="font-quicksand-bold text-md text-gray-900 mb-3">Additional Documents</Text>

          {userDocuments.transcripts.length > 0 && (
            <DocumentSection
              title="Transcripts"
              documents={userDocuments.transcripts}
              icon={<Feather name="book" size={18} color="#10b981" />}
              ownerName={`${userProfile?.firstName} ${userProfile?.lastName}`}
            />
          )}

          {userDocuments.recommendationLetters.length > 0 && (
            <DocumentSection
              title="Recommendation Letters"
              documents={userDocuments.recommendationLetters}
              icon={<Feather name="mail" size={18} color="#10b981" />}
              ownerName={`${userProfile?.firstName} ${userProfile?.lastName}`}
            />
          )}

          {userDocuments.certificates.length > 0 && (
            <DocumentSection
              title="Certificates"
              documents={userDocuments.certificates}
              icon={<Feather name="award" size={18} color="#10b981" />}
              ownerName={`${userProfile?.firstName} ${userProfile?.lastName}`}
            />
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative">
      {isLoading ? (
        <>
          <BackBar label="Back" />
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
            <Text className="font-quicksand-semibold text-lg text-gray-700">Loading applicant details...</Text>
          </View>
        </>
      ) : (
        <>
          <BackBar label="Applicant Profile" />
          <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center gap-3">
              <RenderUserProfileImage user={userProfile} fontSize={18} profileImageSize={10} />
              <View className="flex-1">
                <Text className="font-quicksand-bold text-lg text-gray-900">
                  {userProfile?.firstName} {userProfile?.lastName}
                </Text>
                <Text className="font-quicksand-medium text-sm text-gray-600">{userProfile?.title}</Text>
              </View>
              {user?.role !== "EMPLOYEE" && applicationStatus !== "REJECTED" && (
                <TouchableOpacity
                  className="bg-emerald-500 rounded-lg px-4 py-2"
                  onPress={() => setShowActionsModal(true)}
                >
                  <Text className="font-quicksand-bold text-white text-sm">Actions</Text>
                </TouchableOpacity>
              )}
              {applicationStatus === "REJECTED" && (
                <View
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg px-4 py-1"
                  style={{
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center gap-1.5">
                    <Feather name="x-circle" size={14} color="#dc2626" />
                    <Text className="font-quicksand-bold text-red-700 text-sm">Rejected</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View className="bg-white px-4">
            <View className="flex-row border-b border-gray-200">
              <TouchableOpacity
                className={`flex-1 py-3 ${activeTab === "overview" ? "border-b-2 border-emerald-500" : ""}`}
                onPress={() => setActiveTab("overview")}
              >
                <Text
                  className={`text-center font-quicksand-semibold ${activeTab === "overview" ? "text-emerald-600" : "text-gray-600"}`}
                >
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 ${activeTab === "experience" ? "border-b-2 border-emerald-500" : ""}`}
                onPress={() => setActiveTab("experience")}
              >
                <Text
                  className={`text-center font-quicksand-semibold ${activeTab === "experience" ? "text-emerald-600" : "text-gray-600"}`}
                >
                  Experience
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 ${activeTab === "documents" ? "border-b-2 border-emerald-500" : ""}`}
                onPress={() => setActiveTab("documents")}
              >
                <Text
                  className={`text-center font-quicksand-semibold ${activeTab === "documents" ? "text-emerald-600" : "text-gray-600"}`}
                >
                  Documents
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView className="flex-1 px-4">{renderTabContent()}</ScrollView>
          {applicationStatus !== "REJECTED" && (
            <View
              className="bg-white border-t border-gray-200 px-4 pb-10 pt-6 absolute bottom-0 left-0 right-0"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
              }}
            >
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-emerald-500 rounded-xl py-4 items-center justify-center"
                  style={{
                    shadowColor: "#6366f1",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() => bottomSheetRef.current?.expand()}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="message-circle" size={18} color="white" />
                    <Text className="font-quicksand-bold text-white text-base">Contact Applicant</Text>
                  </View>
                </TouchableOpacity>

                {applicationStatus === "PENDING" && (
                  <TouchableOpacity
                    className={`flex-1 rounded-xl py-4 items-center justify-center ${
                      isShortListed ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    style={{
                      shadowColor: isShortListed ? "#ef4444" : "#10b981",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                    onPress={handleShortList}
                    disabled={makingShortListRequest}
                    activeOpacity={0.8}
                  >
                    {makingShortListRequest ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Feather name={isShortListed ? "x" : "star"} size={18} color="white" />
                        <Text className="font-quicksand-bold text-white text-base">
                          {isShortListed ? "Unshortlist" : "Shortlist"}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </>
      )}
      {viewingDocument && (
        <DocumentModal
          documentType="User Document"
          documentUrl={viewingDocument}
          visible={!!viewingDocument}
          handleClose={() => setViewingDocument(undefined)}
        />
      )}
      <ModalWithBg visible={showActionsModal} customHeight={0.5} customWidth={0.9}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-md text-gray-800">Candidate Actions</Text>
            <TouchableOpacity onPress={() => setShowActionsModal(false)} className="p-2">
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {applicationStatus !== "REJECTED" && (
              <TouchableOpacity
                className="bg-emerald-50 border border-green-200 rounded-xl p-3 mb-3 flex-row items-center gap-3"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowActionsModal(false);
                  bottomSheetRef.current?.expand();
                }}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="message-circle" size={18} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-sm text-gray-900">Contact Candidate</Text>
                  <Text className="font-quicksand-medium text-xs text-gray-600">Get in touch with this candidate</Text>
                </View>
                <Feather name="chevron-right" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
            {applicationStatus === "PENDING" && user?.role !== "EMPLOYEE" && (
              <TouchableOpacity
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex-row items-center gap-3"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowActionsModal(false);
                  router.push(
                    `/businessJobs/applications/applicant/scheduleInterview?applicantId=${application?.id}&jobId=${application?.jobId}&candidateId=${application?.userProfile.id}&applicantFirstName=${userProfile?.firstName}&applicantLastName=${userProfile?.lastName}&applicantEmail=${userProfile?.email}`
                  );
                }}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                  <Feather name="calendar" size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-sm text-gray-900">Schedule Interview</Text>
                  <Text className="font-quicksand-medium text-xs text-gray-600">
                    Set up an interview with this candidate
                  </Text>
                </View>
                <Feather name="chevron-right" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
            {applicationStatus === "PENDING" && (
              <TouchableOpacity
                className={`border rounded-xl p-3 mb-3 flex-row items-center gap-3 ${
                  isShortListed ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                }`}
                style={{
                  shadowColor: isShortListed ? "#ef4444" : "#3b82f6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowActionsModal(false);
                  handleShortList();
                }}
                activeOpacity={0.7}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isShortListed ? "bg-red-100" : "bg-blue-100"
                  }`}
                >
                  <Feather
                    name={isShortListed ? "x" : "star"}
                    size={18}
                    color={isShortListed ? "#ef4444" : "#3b82f6"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-sm text-gray-900">
                    {isShortListed ? "Remove from Shortlist" : "Add to Shortlist"}
                  </Text>
                  <Text className="font-quicksand-medium text-xs text-gray-600">
                    {isShortListed
                      ? "Remove this candidate from your shortlist"
                      : "Mark this candidate as a top prospect"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
            {applicationStatus === "PENDING" && user?.role !== "EMPLOYEE" && (
              <TouchableOpacity
                className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex-row items-center gap-3"
                style={{
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={handleRejectCandidate}
                disabled={isUpdatingReject}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                  {isUpdatingReject ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Feather name="x-circle" size={18} color="#ef4444" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-sm text-gray-900">Reject Candidate</Text>
                  <Text className="font-quicksand-medium text-xs text-gray-600">
                    Decline this application permanently
                  </Text>
                </View>
                <Feather name="chevron-right" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
            {applicationStatus !== "PENDING" && (
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
                {applicationStatus !== "OFFER_ACCEPTED" &&
                  applicationStatus !== "OFFER_REJECTED" &&
                  applicationStatus !== "OFFER_MADE" && (
                    <>
                      {" "}
                      <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1">
                        <Feather name="info" size={20} color="#6b7280" />
                      </View>
                      <Text className="font-quicksand-bold text-sm text-gray-900 text-center mb-2">
                        No Actions Available
                      </Text>
                      <Text className="font-quicksand-medium text-xs text-gray-600 text-center">
                        This candidate&apos;s application status is &quot;
                        {applicationStatus?.toLowerCase().replace("_", " ")}&quot; and cannot be modified.
                      </Text>
                    </>
                  )}

                {applicationStatus === "OFFER_ACCEPTED" && (
                  <View className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                        <Feather name="check-circle" size={16} color="#10b981" />
                      </View>
                      <Text className="font-quicksand-bold text-sm text-emerald-900">Offer Accepted!</Text>
                    </View>
                    <Text className="font-quicksand-medium text-xs text-emerald-800 leading-5">
                      Congratulations! {application?.fullName} has accepted your unofficial job offer. You can proceed
                      with your hiring process now. We hope you enjoyed your Jobee experience.
                    </Text>
                  </View>
                )}
                {applicationStatus === "OFFER_REJECTED" && (
                  <View className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                        <Feather name="check-circle" size={16} color="#10b981" />
                      </View>
                      <Text className="font-quicksand-bold text-sm text-red-900">Offer Rejected</Text>
                    </View>
                    <Text className="font-quicksand-medium text-xs text-red-800 leading-5">
                      It seems {application?.fullName} has rejected your unofficial job offer.
                    </Text>
                  </View>
                )}
                {applicationStatus === "OFFER_MADE" && (
                  <View className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center">
                        <Feather name="check-circle" size={16} color="#10b981" />
                      </View>
                      <Text className="font-quicksand-bold text-sm text-amber-900">Offer Made</Text>
                    </View>
                    <Text className="font-quicksand-medium text-xs text-amber-800 leading-5">
                      We will let you know what {application?.fullName} says to your unofficial job offer.
                    </Text>
                  </View>
                )}
                {applicationData?.status === "INTERVIEW_SCHEDULED" &&
                  applicationData.interviewIds &&
                  applicationData.interviewIds.length > 0 && (
                    <TouchableOpacity
                      className="mt-3"
                      onPress={() => {
                        setShowActionsModal(false);
                        const interviewEndpointId = applicationData.interviewIds?.slice(0, 1)[0] || interviewId;
                        router.push(`/businessJobs/interviews/interview/${interviewEndpointId}`);
                      }}
                    >
                      <Text className="font-quicksand-bold text-emerald-600 text-sm">View Scheduled Interview</Text>
                    </TouchableOpacity>
                  )}
                {applicationData?.status === "INTERVIEW_COMPLETED" &&
                  applicationData.interviewIds &&
                  applicationData.interviewIds.length > 0 && (
                    <TouchableOpacity
                      className="mt-3"
                      onPress={() => {
                        setShowActionsModal(false);
                        const interviewEndpointId = applicationData.interviewIds?.slice(0, 1)[0] || interviewId;
                        router.push(`/businessJobs/interviews/interview/${interviewEndpointId}`);
                      }}
                    >
                      <Text className="font-quicksand-bold text-emerald-600 text-sm">Next Steps</Text>
                    </TouchableOpacity>
                  )}
              </View>
            )}
          </ScrollView>
          <View className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <View className="flex-row items-center gap-3">
              <RenderUserProfileImage user={userProfile} profileImageSize={12} fontSize={16} />
              <View className="flex-1">
                <Text className="font-quicksand-bold text-sm text-gray-900">
                  {userProfile?.firstName} {userProfile?.lastName}
                </Text>
                <Text className="font-quicksand-medium text-xs text-gray-600">Applied for {application?.jobTitle}</Text>
              </View>
              <View
                className={`px-2 py-1 rounded-lg ${
                  applicationStatus === "PENDING"
                    ? "bg-yellow-100"
                    : applicationStatus === "REJECTED"
                      ? "bg-red-100"
                      : applicationStatus === "INTERVIEW_SCHEDULED"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-quicksand-bold text-xs ${
                    applicationStatus === "PENDING"
                      ? "text-yellow-800"
                      : applicationStatus === "REJECTED"
                        ? "text-red-800"
                        : applicationStatus === "INTERVIEW_SCHEDULED"
                          ? "text-blue-800"
                          : "text-gray-800"
                  }`}
                >
                  {getApplicationStatusLabel(applicationStatus || "")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ModalWithBg>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["35%", "45%"]}
        enablePanDownToClose
        keyboardBehavior="extend"
        backgroundStyle={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <ContactCandidate
          userProfile={userProfile as User}
          customSMSBody={` I saw your application on Jobee for ${application?.jobTitle} at ${application?.companyName}.`}
          customEmailSubject={`Regarding your application for ${application?.jobTitle} at ${application?.companyName}.`}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ApplicantForBusiness;
