import { InterviewPreparation } from "@/type";
import React from "react";
import { Text, View } from "react-native";
import VerticalAnimatedList from "../VerticalAnimatedList";

const Weaknesses = ({ interviewPrep }: { interviewPrep: InterviewPreparation }) => {
  return (
    <View key={10} className="w-full h-full items-center justify-start">
      <Text className="font-quicksand-bold text-2xl text-center">
        Now the bad news. There are certain areas you need to improve on.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center mt-4">
        Focus on these areas and be ready to answer questions about them.
      </Text>
      <VerticalAnimatedList strengths={interviewPrep?.weaknesses || []} />
    </View>
  );
};

export default Weaknesses;
