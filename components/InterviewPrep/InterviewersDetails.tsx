import { getInterviewerProfileSummary } from "@/lib/interviewEndpoints";
import { InterviewDetails, InterviewerProfileSummary } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import RenderBusinessProfileImage from "../RenderBusinessProfileImage";
import ViewInterviewerModal from "../ViewInterviewerModal";

const InterviewersDetails = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  const [interviewModalVisible, setInterviewModalVisible] = useState(false);
  const [loadingInterviewer, setLoadingInterviewer] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<InterviewerProfileSummary | null>(null);

  const interviewers = [...(interviewDetails?.interviewers || []), ...(interviewDetails?.otherInterviewers || [])];
  const totalInterviewers = interviewers.length;

  const handleInterviewerPress = async (email: string, firstName: string, lastName: string) => {
    setInterviewModalVisible(true);
    setLoadingInterviewer(true);
    try {
      const details = await getInterviewerProfileSummary(email);
      if (details) {
        setInterviewerDetails({ ...details, verified: true });
      } else {
        setInterviewerDetails({
          firstName,
          lastName,
          email,
          title: "",
          summary: "",
          id: 0,
          verified: false,
          profileImageUrl: "",
        });
      }
      return;
    } catch (error) {
      console.error("Error fetching interviewer details:", error);
      return;
    } finally {
      setLoadingInterviewer(false);
    }
  };

  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="users" size={28} color="#10b981" />
        </View>

        <Text className="font-quicksand-bold text-2xl text-center text-gray-800 leading-8 mb-2">
          Meet Your Interview Panel
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          You will be meeting with{" "}
          <Text className="font-quicksand-bold text-emerald-600">
            {totalInterviewers} interviewer{totalInterviewers > 1 ? "s" : ""}
          </Text>
          . Tap on each person to learn more about their background and role.
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl p-5 border border-gray-100 mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center justify-center gap-3">
          <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
            <Text className="font-quicksand-bold text-emerald-600 text-lg">{totalInterviewers}</Text>
          </View>
          <Text className="font-quicksand-semibold text-gray-700 text-base">
            Interview Panel Member{totalInterviewers > 1 ? "s" : ""}
          </Text>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="gap-4">
          {interviewers.map((interviewer, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-2xl p-5 border border-gray-100"
              onPress={() =>
                handleInterviewerPress(
                  interviewer.email,
                  interviewer.name.split(" ")[0],
                  interviewer.name.split(" ")[1] || ""
                )
              }
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className="relative"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <RenderBusinessProfileImage profileImageUrl={interviewer.profileImageUrl} />
                  <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white items-center justify-center">
                    <Feather name="user" size={10} color="white" />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-bold text-lg text-gray-800 mb-1">{interviewer.name}</Text>
                  <Text className="font-quicksand-medium text-sm text-gray-600 mb-2">
                    {interviewer.title || "Role not specified"}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <Text className="font-quicksand-medium text-xs text-emerald-600">Tap to view profile</Text>
                  </View>
                </View>
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Feather name="chevron-right" size={16} color="#6b7280" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <View className="flex-row items-center gap-2 mb-2">
          <FontAwesome5 name="lightbulb" size={16} color="#3b82f6" />
          <Text className="font-quicksand-bold text-blue-800 text-sm">Interview Tips</Text>
        </View>
        <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
          Research each interviewer&apos;s background to find common ground and prepare relevant questions. This shows
          initiative and genuine interest.
        </Text>
      </View>

      <ViewInterviewerModal
        visible={interviewModalVisible}
        handleClose={setInterviewModalVisible}
        loadingInterviewer={loadingInterviewer}
        interviewerDetails={interviewerDetails}
      />
    </ScrollView>
  );
};

export default InterviewersDetails;
