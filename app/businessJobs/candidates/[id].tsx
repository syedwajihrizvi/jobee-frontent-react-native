import ApplicantSection from "@/components/ApplicantSection";
import BackBar from "@/components/BackBar";
import CollapsibleSection from "@/components/CollapsibleSection";
import ContactCandidate from "@/components/ContactCandidate";
import DocumentModal from "@/components/DocumentModal";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import UserVideoIntro from "@/components/UserVideoIntro";
import { getS3VideoIntroUrl } from "@/lib/s3Urls";
import { useUserProfileForBusiness } from "@/lib/services/useUserProfileForBusiness";
import { User } from "@/type";
import { Feather, FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Candidate = () => {
  const { id } = useLocalSearchParams();
  const { data: userProfile, isLoading } = useUserProfileForBusiness(Number(id));
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showSkills, setShowSkills] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<string | undefined>();

  const handleResumePress = () => {
    if (userProfile?.primaryResume) setViewingDocument(userProfile?.primaryResume?.documentUrl);
  };

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
          <BackBar label={`${userProfile?.firstName} ${userProfile?.lastName}`} />
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
                  <RenderUserProfileImage user={userProfile} profileImageUrl={userProfile?.profileImageUrl} />
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
              <TouchableOpacity
                className="bg-emerald-500 rounded-lg px-2 py-3 flex-row items-center justify-center gap-2"
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
                {userProfile?.primaryResume ? (
                  <>
                    <Feather name="file-text" size={18} color="white" />
                    <Text className="font-quicksand-bold text-white text-md">View Resume</Text>
                  </>
                ) : (
                  <Text className="font-quicksand-bold text-white text-md">No Resume Uploaded</Text>
                )}
              </TouchableOpacity>
            </View>
            <View className="mx-4 mt-4 gap-2">
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
            </View>
          </View>
        </>
      )}
      {viewingDocument && (
        <DocumentModal
          documentType="Resume"
          documentUrl={viewingDocument}
          visible={!!viewingDocument}
          handleClose={() => setViewingDocument(undefined)}
        />
      )}
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
          customSMSBody={` I saw your profile on Jobee, would you be interested in a quick chat?`}
          customEmailSubject={`Connecting regarding opportunities at our company`}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default Candidate;
