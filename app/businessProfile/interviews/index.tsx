import BackBar from "@/components/BackBar";
import RenderInterviews from "@/components/RenderInterviews";
import { InterviewFilter } from "@/type";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Interviews = () => {
  const { status } = useLocalSearchParams();
  const interviewStatus = status as InterviewFilter;
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Interviews" />
      <RenderInterviews status={interviewStatus} />
    </SafeAreaView>
  );
};

export default Interviews;
