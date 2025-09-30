import { renderInterviewType } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import React from "react";
import { Text, View } from "react-native";

const Conducted = ({
  interviewDetails,
}: {
  interviewDetails: InterviewDetails | undefined;
}) => {
  return (
    <View className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Its very important to understand how the interview will be conducted. It
        could make or break your performance in the interview.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center">
        {renderInterviewType(interviewDetails?.interviewType)}
      </Text>
      <Text className="text-center">
        ***ADD IN TESTING FOR PHONE NUMBER, MEETING LINK, ADDRESS***
      </Text>
    </View>
  );
};

export default Conducted;
