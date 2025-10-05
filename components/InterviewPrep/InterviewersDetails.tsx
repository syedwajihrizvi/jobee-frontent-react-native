import { images } from "@/constants";
import { getInterviewerProfileSummary } from "@/lib/interviewEndpoints";
import { InterviewDetails, InterviewerProfileSummary } from "@/type";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import ViewInterviewerModal from "../ViewInterviewerModal";

const InterviewersDetails = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  const [interviewModalVisible, setInterviewModalVisible] = useState(false);
  const [loadingInterviewer, setLoadingInterviewer] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<InterviewerProfileSummary | null>(null);
  const interviewers = [...(interviewDetails?.interviewers || []), ...(interviewDetails?.otherInterviewers || [])];
  const handleInterviewerPress = async (email: string, firstName: string, lastName: string) => {
    setInterviewModalVisible(true);
    setLoadingInterviewer(true);
    try {
      const details = await getInterviewerProfileSummary(email);
      if (details) {
        setInterviewerDetails({ ...details, verified: true });
      } else {
        setInterviewerDetails({ firstName, lastName, email, title: "", summary: "", id: 0, verified: false });
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
    <View key={6} className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Seems you have {interviewDetails?.interviewers.length! + interviewDetails?.otherInterviewers.length!}{" "}
        interviewers. Here are their names and roles. Click on their names to view more information.
      </Text>
      <View className="w-full flex flex-col gap-4 mt-4 px-4">
        {interviewers.map((interviewer, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row items-center gap-4 bg-green-500 dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-md"
            onPress={() =>
              handleInterviewerPress(
                interviewer.email,
                interviewer.name.split(" ")[0],
                interviewer.name.split(" ")[1] || ""
              )
            }
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Image source={{ uri: images.companyLogo }} className="w-10 h-10 rounded-full" />
            <View className="flex flex-col justify-between">
              <Text className="font-quicksand-semibold text-lg flex-shrink">{interviewer.name}</Text>
              <Text className="text-green-800 dark:text-gray-300">{interviewer.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <ViewInterviewerModal
        visible={interviewModalVisible}
        handleClose={setInterviewModalVisible}
        loadingInterviewer={loadingInterviewer}
        interviewerDetails={interviewerDetails}
      />
    </View>
  );
};

export default InterviewersDetails;
