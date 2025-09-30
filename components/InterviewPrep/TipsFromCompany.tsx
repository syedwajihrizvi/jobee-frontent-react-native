import { InterviewPreparation } from "@/type";
import React from "react";
import { Text, View } from "react-native";
import CheckList from "../CheckList";

const TipsFromCompany = ({ interviewPrep }: { interviewPrep: InterviewPreparation }) => {
  return (
    <View className="w-full h-full items-center justify-start gap-10">
      <Text className="font-quicksand-bold text-2xl text-center">
        Make sure to review the following tips provided to you by the company.
      </Text>
      <CheckList items={interviewPrep?.notesFromInterviewer || []} />
    </View>
  );
};

export default TipsFromCompany;
