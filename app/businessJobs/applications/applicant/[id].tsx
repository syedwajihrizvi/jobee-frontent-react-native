import ApplicantSection from "@/components/ApplicantSection";
import BackBar from "@/components/BackBar";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentModal from "@/components/DocumentModal";
import RenderAppStatusButton from "@/components/RenderAppStatusButton";
import UserVideoIntro from "@/components/UserVideoIntro";
import { images } from "@/constants";
import { shortListCandidate, unshortListCandidate } from "@/lib/jobEndpoints";
import { getS3ProfileImage, getS3VideoIntroUrl } from "@/lib/s3Urls";
import { updateApplicationStatus } from "@/lib/services/applicationEndpoints";
import { useShortListedCandidatesForJob } from "@/lib/services/useJobs";
import { useApplicant } from "@/lib/services/useProfile";
import { addViewToProfile } from "@/lib/updateUserProfile";
import { Feather, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ApplicantForBusiness = () => {
  const queryClient = useQueryClient();
  const { id, jobId, candidateId } = useLocalSearchParams();
  const { data: applicationData, isLoading } = useApplicant(Number(id), Number(jobId), Number(candidateId));
  const [application, setApplication] = useState(applicationData);
  const { data: shortListedCandidates } = useShortListedCandidatesForJob(Number(application?.jobId));
  const { userProfile } = application || {};
  const [isUpdatingReject, setIsUpdatingReject] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [makingShortListRequest, setMakingShortListRequest] = useState(false);
  const [isShortListed, setIsShortListed] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | undefined>();

  useEffect(() => {
    if (applicationData && !isLoading) {
      setApplication(applicationData);
    }
  }, [applicationData, isLoading]);

  useEffect(() => {
    if (shortListedCandidates && application) {
      setIsShortListed(shortListedCandidates?.includes(application?.id) || false);
    }
  }, [shortListedCandidates, application]);

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

  const renderNonPendingStatus = () => {
    if (!application) return null;
    switch (application.status) {
      case "REJECTED":
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
            <Text className="font-quicksand-bold text-white text-sm">Candidate Already Rejected</Text>
          </TouchableOpacity>
        );
      case "INTERVIEW_SCHEDULED":
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
            onPress={() => console.log("View interview details via bottom sheet")}
            activeOpacity={0.8}
          >
            <Feather name="clock" size={14} color="white" />
            <Text className="font-quicksand-bold text-white text-sm">Interview Scheduled</Text>
          </TouchableOpacity>
        );
    }
  };

  const handleShortList = async () => {
    if (!application) return;
    setMakingShortListRequest(true);
    try {
      const result = await shortListCandidate({
        applicationId: application.id,
      });
      if (result) {
        Alert.alert("Success", "Candidate added to shortlist successfully.");
        setIsShortListed(true);
        queryClient.invalidateQueries({
          queryKey: [application.jobId, "shortlist"],
        });
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

  const handleUnshortList = async () => {
    if (!application) return;
    setMakingShortListRequest(true);
    try {
      const result = await unshortListCandidate({
        applicationId: application.id,
      });
      if (result) {
        Alert.alert("Success", "Candidate removed from shortlist successfully.");
        setIsShortListed(false);
        queryClient.invalidateQueries({
          queryKey: [application.jobId, "shortlist"],
        });
      } else {
        Alert.alert("Error", "Failed to remove candidate from shortlist.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to remove candidate from shortlist.");
    } finally {
      setMakingShortListRequest(false);
    }
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
                  <View
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Image
                      source={{
                        uri: userProfile?.profileImageUrl
                          ? getS3ProfileImage(userProfile?.profileImageUrl)
                          : images.companyLogo,
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-xl text-gray-900">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </Text>
                    <Text className="font-quicksand-semibold text-base text-gray-700">{userProfile?.title}</Text>
                    <View className="flex-row items-center gap-1">
                      <Feather name="map-pin" size={14} color="#6b7280" />
                      <Text className="font-quicksand-medium text-sm text-gray-600">{userProfile?.location}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="mb-2">
                <Text className="font-quicksand-bold text-lg text-gray-900">Professional Summary</Text>
                <Text className="font-quicksand-medium text-base text-gray-700">{userProfile?.summary}</Text>
              </View>
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  className="bg-blue-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
                  style={{
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={handleResumePress}
                  activeOpacity={0.8}
                >
                  <Feather name="file-text" size={14} color="white" />
                  <Text className="font-quicksand-bold text-white text-sm">View Resume</Text>
                </TouchableOpacity>

                {application?.coverLetterUrl && (
                  <TouchableOpacity
                    className="bg-purple-500 rounded-xl px-4 py-3 flex-row items-center gap-2"
                    style={{
                      shadowColor: "#8b5cf6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={handleCoverLetterPress}
                    activeOpacity={0.8}
                  >
                    <Feather name="mail" size={14} color="white" />
                    <Text className="font-quicksand-bold text-white text-sm">Cover Letter</Text>
                  </TouchableOpacity>
                )}
                {application?.status === "PENDING" ? (
                  <>
                    <RenderAppStatusButton
                      icon={<Feather name="calendar" size={14} color="white" />}
                      color="emerald"
                      loading={false}
                      label="Schedule Interview"
                      shadowColor="#10b981"
                      handlePress={() =>
                        router.push(
                          `/businessJobs/applications/applicant/scheduleInterview?applicantId=${application?.id}&jobId=${application?.jobId}&candidateId=${application.userProfile.id}`
                        )
                      }
                    />
                    <RenderAppStatusButton
                      icon={<Feather name="x" size={14} color="white" />}
                      loading={isUpdatingReject}
                      color="red"
                      label="Reject Candidate"
                      shadowColor="#3b82f6"
                      handlePress={handleRejectCandidate}
                    />
                  </>
                ) : (
                  renderNonPendingStatus()
                )}
              </View>
            </View>
            <View className="mx-4 mt-4">
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
                  onPress={isShortListed ? handleUnshortList : handleShortList}
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
    </SafeAreaView>
  );
};

export default ApplicantForBusiness;
