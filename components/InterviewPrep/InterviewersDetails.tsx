import { images } from "@/constants";
import { InterviewDetails } from "@/type";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const InterviewersDetails = ({
  interviewDetails,
}: {
  interviewDetails: InterviewDetails | undefined;
}) => {
  const interviewers = [
    ...(interviewDetails?.interviewers || []),
    ...(interviewDetails?.otherInterviewers || []),
  ];

  return (
    <View key={6} className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Seems you have{" "}
        {interviewDetails?.interviewers.length! +
          interviewDetails?.otherInterviewers.length!}{" "}
        interviewers. Here are their names and roles. Click on their names to
        view more information.
      </Text>
      <View className="w-full flex flex-col gap-4 mt-4 px-4">
        {interviewers.map((interviewer, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row items-center gap-4 bg-green-500 dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-md"
            onPress={() => console.log("View Interviewer Profile")}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Image
              source={{ uri: images.companyLogo }}
              className="w-10 h-10 rounded-full"
            />
            <View className="flex flex-col justify-between">
              <Text className="font-quicksand-semibold text-lg flex-shrink">
                {interviewer.name}
              </Text>
              <Text className="text-green-800 dark:text-gray-300">
                Lead Software Engineer
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default InterviewersDetails;
