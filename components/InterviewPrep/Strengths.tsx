import { InterviewPreparation } from "@/type";
import React from "react";
import { Text, View } from "react-native";
import VerticalAnimatedList from "../VerticalAnimatedList";

const Strengths = ({ interviewPrep }: { interviewPrep: InterviewPreparation }) => {
  return (
    <View className="w-full h-full items-center justify-start">
      <Text className="font-quicksand-bold text-2xl text-center">
        Good news first. You have many strenghts that make you a great fit for the role.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center mt-4">
        Remember to try to highlight your strengths in your interview.
      </Text>
      <VerticalAnimatedList strengths={interviewPrep?.strengths || []} />
    </View>
  );
};

export default Strengths;
