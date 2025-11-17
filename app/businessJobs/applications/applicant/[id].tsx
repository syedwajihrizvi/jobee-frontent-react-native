import ApplicantSection from "@/components/ApplicantSection";
import BackBar from "@/components/BackBar";
import CollapsibleSection from "@/components/CollapsibleSection";
import ContactCandidate from "@/components/ContactCandidate";
import DocumentModal from "@/components/DocumentModal";
import ModalWithBg from "@/components/ModalWithBg";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import UserVideoIntro from "@/components/UserVideoIntro";
import { shortListCandidate, unshortListCandidate } from "@/lib/jobEndpoints";
import { getS3VideoIntroUrl } from "@/lib/s3Urls";
import { updateApplicationStatus } from "@/lib/services/applicationEndpoints";
import { useApplicant } from "@/lib/services/useProfile";
import { addViewToProfile } from "@/lib/updateUserProfile";
import { getApplicationStatus } from "@/lib/utils";
import useApplicationStore from "@/store/applications.store";
import useAuthStore from "@/store/auth.store";
import { BusinessUser, User } from "@/type";
import { Feather, FontAwesome, FontAwesome5, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ApplicantForBusiness = () => {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const { user: authUser } = useAuthStore();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const {
    addToShortListedApplications,
    removeFromShortListedApplications,
    isCandidateShortListed,
    setApplicationStatus,
  } = useApplicationStore();
  const { data: applicationData, isLoading } = useApplicant(Number(id));
  const [application, setApplication] = useState(applicationData);
  const { userProfile } = application || {};
  const [isUpdatingReject, setIsUpdatingReject] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [makingShortListRequest, setMakingShortListRequest] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | undefined>();
  const user = authUser as BusinessUser | null;
  const isShortListed = isCandidateShortListed(Number(application?.jobId), Number(application?.id));

  useEffect(() => {
    if (applicationData && !isLoading) {
      setApplication(applicationData);
    }
  }, [applicationData, isLoading]);

  useEffect(() => {
    const addProfileView = async () => {
      await addViewToProfile(Number(application?.userProfile.id));
      console.log("Profile view added");
    };
    addProfileView();
  }, [application]);

  const handleRejectCandidate = async () => {
    Alert.alert("Confirm Rejection", "Are you sure you want to reject this candidate? This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
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
              queryClient.invalidateQueries({
                queryKey: ["applicant", Number(application?.id)],
              });
            }
          } catch (error) {
            console.log("Error rejecting candidate: ", error);
          } finally {
            setIsUpdatingReject(false);
          }
        },
      },
    ]);
  };

  const renderActionButtons = () => {
    if (user?.role === "EMPLOYEE") {
      if (application?.status === "INTERVIEW_SCHEDULED") {
        return (
          <TouchableOpacity
            className="bg-amber-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
            style={{
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => {
              const interviewIds = application.interviewIds || [];
              if (interviewIds.length === 0) {
                return router.push(`/businessJobs/applications/${application.jobId}`);
              } else {
                const latestInterviewId = interviewIds[interviewIds.length - 1];
                return router.push(`/businessJobs/interviews/interview/${latestInterviewId}`);
              }
            }}
            activeOpacity={0.8}
          >
            <Feather name="clock" size={14} color="white" />
            <Text className="font-quicksand-bold text-white text-xs">Interview Scheduled</Text>
          </TouchableOpacity>
        );
      } else if (application?.status === "REJECTED") {
        return (
          <TouchableOpacity
            className="bg-red-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
            style={{
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => console.log("View interview details via bottom sheet")}
            activeOpacity={0.8}
          >
            <Text className="font-quicksand-bold text-white text-xs">Candidate Already Rejected</Text>
          </TouchableOpacity>
        );
      } else if (isCandidateShortListed(Number(application?.jobId), Number(application?.id))) {
        return (
          <View
            className="bg-emerald-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
            style={{
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-white text-xs">Shortlisted</Text>
          </View>
        );
      }
    }
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

  const handleResumePress = () => {
    setViewingDocument(application?.resumeUrl);
  };

  const handleCoverLetterPress = () => {
    setViewingDocument(application?.coverLetterUrl);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative pb-20">
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
          <BackBar label="Applicant Details" />
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-row items-start gap-4 flex-1">
                  <RenderUserProfileImage user={userProfile} fontSize={20} profileImageSize={14} />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-quicksand-bold text-xl text-gray-900">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </Text>
                      {user?.role !== "EMPLOYEE" && (
                        <TouchableOpacity className="flex-row gap-1" onPress={() => setShowActionsModal(true)}>
                          <SimpleLineIcons name="options-vertical" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text className="font-quicksand-semibold text-base text-gray-700">{userProfile?.title}</Text>
                    <View className="flex-row items-center gap-1">
                      <Feather name="map-pin" size={14} color="#6b7280" />
                      <Text className="font-quicksand-medium text-sm text-gray-600">{userProfile?.location}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="mb-2">
                <Text className="font-quicksand-semibold text-lg text-gray-900">Professional Summary</Text>
                <Text className="font-quicksand-medium text-base text-gray-700">{userProfile?.summary}</Text>
              </View>
              {user?.role === "EMPLOYEE" && (
                <View className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex-row gap-3">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                    <Feather name="info" size={14} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-sm text-blue-800 mb-1">Shortlisting Process</Text>
                    <Text className="font-quicksand-medium text-xs text-blue-700 leading-4">
                      When you shortlist a candidate, your recruiter will be notified to schedule an interview with
                      them.
                    </Text>
                  </View>
                </View>
              )}
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  className="bg-white border-2 border-gray-500 rounded-xl px-3 py-2 flex-row items-center gap-2"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={handleResumePress}
                  activeOpacity={0.8}
                >
                  <View className="w-5 h-5 bg-gray-100 rounded-full items-center justify-center">
                    <Feather name="file-text" size={14} color="#1f2937" />
                  </View>
                  <Text className="font-quicksand-semibold text-gray-900 text-sm">View Resume</Text>
                </TouchableOpacity>

                {application?.coverLetterUrl && (
                  <TouchableOpacity
                    className="bg-white border-2 border-gray-500 rounded-xl px-3 py-2 flex-row items-center gap-2"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={handleCoverLetterPress}
                    activeOpacity={0.8}
                  >
                    <View className="w-5 h-5 bg-gray-100 rounded-full items-center justify-center">
                      <Feather name="mail" size={14} color="#1f2937" />
                    </View>
                    <Text className="font-quicksand-semibold text-gray-900 text-sm">Cover Letter</Text>
                  </TouchableOpacity>
                )}

                {renderActionButtons()}
              </View>
            </View>
            <View className="mx-4 mt-4 gap-4">
              <CollapsibleSection
                title="Skills"
                icon={<Ionicons name="bulb" size={16} color="#f59e0b" />}
                isOpen={showSkills}
                onToggle={() => setShowSkills(!showSkills)}
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
                        className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl"
                        style={{
                          shadowColor: "#3b82f6",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text className="text-blue-800 font-quicksand-semibold text-sm">{skill.skill.name}</Text>
                      </View>
                    ))}
                  </View>
                </ApplicantSection>
              </CollapsibleSection>
              <CollapsibleSection
                title="Work Experience"
                icon={<FontAwesome5 name="briefcase" size={16} color="#10b981" />}
                isOpen={showExperience}
                onToggle={() => setShowExperience(!showExperience)}
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
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 gap-1"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text className="font-quicksand-bold text-base text-gray-900">{exp.title}</Text>
                        <Text className="font-quicksand-semibold text-sm text-emerald-600">{exp.company}</Text>
                        <Text className="font-quicksand-medium text-sm text-gray-600">
                          {exp.from} - {exp.to || "Present"}
                        </Text>
                        <Text className="font-quicksand-medium text-sm text-gray-700 leading-5">{exp.description}</Text>
                      </View>
                    ))}
                  </View>
                </ApplicantSection>
              </CollapsibleSection>
              <CollapsibleSection
                title="Education"
                icon={<FontAwesome name="university" size={16} color="#8b5cf6" />}
                isOpen={showEducation}
                onToggle={() => setShowEducation(!showEducation)}
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
                        className="bg-purple-50 border border-purple-200 rounded-xl p-4 gap-1"
                        style={{
                          shadowColor: "#8b5cf6",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text className="font-quicksand-bold text-base text-gray-900">{edu.degree}</Text>
                        <Text className="font-quicksand-semibold text-sm text-purple-600">{edu.institution}</Text>
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
                icon={<FontAwesome5 name="project-diagram" size={16} color="#ef4444" />}
                isOpen={showProjects}
                onToggle={() => setShowProjects(!showProjects)}
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
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 gap-1"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                        >
                          <Text className="font-quicksand-bold text-base text-gray-900">{project.name}</Text>
                          <Text className="font-quicksand-semibold text-sm text-emerald-600">{project.link}</Text>
                          <Text className="font-quicksand-medium text-sm text-gray-600">{project.yearCompleted}</Text>
                          <Text className="font-quicksand-medium text-sm text-gray-700 leading-5">
                            {project.description}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </ApplicantSection>
              </CollapsibleSection>
              <CollapsibleSection
                title="Certificates & Awards"
                icon={<FontAwesome5 name="award" size={16} color="#f97316" />}
                isOpen={showCertificates}
                onToggle={() => setShowCertificates(!showCertificates)}
              >
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
                  <Feather name="award" size={24} color="#6b7280" />
                  <Text className="font-quicksand-medium text-gray-600 mt-2">No certificates added</Text>
                </View>
              </CollapsibleSection>
            </View>
            {userProfile?.videoIntroUrl && (
              <View className="mx-4 mt-4">
                <View
                  className="bg-white rounded-2xl p-5 border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                      <Feather name="video" size={16} color="#6366f1" />
                    </View>
                    <Text className="font-quicksand-bold text-lg text-gray-900">Video Introduction</Text>
                  </View>
                  <UserVideoIntro videoSource={getS3VideoIntroUrl(userProfile.videoIntroUrl)} />
                </View>
              </View>
            )}
            <View className="flex-1" />
          </ScrollView>
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

              {application?.status === "PENDING" && (
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
      <ModalWithBg visible={showActionsModal} customHeight={0.6} customWidth={0.9}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Candidate Actions</Text>
            <TouchableOpacity onPress={() => setShowActionsModal(false)} className="p-2">
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {application?.status === "PENDING" && user?.role !== "EMPLOYEE" && (
              <TouchableOpacity
                className="bg-emerald-50 border border-green-200 rounded-xl p-4 mb-4 flex-row items-center gap-4"
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
                    `/businessJobs/applications/applicant/scheduleInterview?applicantId=${application?.id}&jobId=${application?.jobId}&candidateId=${application.userProfile.id}`
                  );
                }}
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="calendar" size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-base text-gray-900">Schedule Interview</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    Set up an interview with this candidate
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
            {application?.status === "PENDING" && (
              <TouchableOpacity
                className={`border rounded-xl p-4 mb-4 flex-row items-center gap-4 ${
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
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    isShortListed ? "bg-red-100" : "bg-blue-100"
                  }`}
                >
                  <Feather
                    name={isShortListed ? "x" : "star"}
                    size={20}
                    color={isShortListed ? "#ef4444" : "#3b82f6"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-base text-gray-900">
                    {isShortListed ? "Remove from Shortlist" : "Add to Shortlist"}
                  </Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    {isShortListed
                      ? "Remove this candidate from your shortlist"
                      : "Mark this candidate as a top prospect"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
            {application?.status === "PENDING" && user?.role !== "EMPLOYEE" && (
              <TouchableOpacity
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center gap-4"
                style={{
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setShowActionsModal(false);
                  handleRejectCandidate();
                }}
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                  <Feather name="x-circle" size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-base text-gray-900">Reject Candidate</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600">
                    Decline this application permanently
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
            {application?.status !== "PENDING" && (
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-6 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Feather name="info" size={24} color="#6b7280" />
                </View>
                <Text className="font-quicksand-bold text-base text-gray-900 text-center mb-2">
                  No Actions Available
                </Text>
                <Text className="font-quicksand-medium text-sm text-gray-600 text-center">
                  This candidate&apos;s application status is &quot;
                  {application?.status.toLowerCase().replace("_", " ")}&quot; and cannot be modified.
                </Text>
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
                  application?.status === "PENDING"
                    ? "bg-yellow-100"
                    : application?.status === "REJECTED"
                      ? "bg-red-100"
                      : application?.status === "INTERVIEW_SCHEDULED"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-quicksand-bold text-xs ${
                    application?.status === "PENDING"
                      ? "text-yellow-800"
                      : application?.status === "REJECTED"
                        ? "text-red-800"
                        : application?.status === "INTERVIEW_SCHEDULED"
                          ? "text-blue-800"
                          : "text-gray-800"
                  }`}
                >
                  {getApplicationStatus(application?.status || "")}
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
