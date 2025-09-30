import { interviewPrepChecklist } from "@/constants";
import { InterviewDetails } from "@/type";
import React from "react";
import { Text, View } from "react-native";

const Introduction = ({
  interviewDetails,
}: {
  interviewDetails: InterviewDetails | undefined;
}) => {
  return (
    <View key={1} className="w-full h-full items-center justify-start gap-10">
      <Text className="font-quicksand-bold text-2xl text-center">
        Let&apos;s get you prepared for your interview at{" "}
        {interviewDetails?.companyName}!
      </Text>
      <View
        className="w-4/5 border border-green-500 rounded-xl p-4 bg-green-500"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10, // For Android
        }}
      >
        {interviewPrepChecklist.map((item, index) => (
          <View key={index} className="flex flex-row items-start mb-2 gap-3">
            <Text className="font-quicksand-bold text-lg">{index + 1})</Text>
            <Text className="font-quicksand-semibold text-lg flex-shrink">
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Introduction;
