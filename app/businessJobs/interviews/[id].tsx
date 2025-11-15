import BackBar from "@/components/BackBar";
import RenderInterviews from "@/components/RenderInterviews";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Interviews = () => {
  const { id, jobTitle } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label={`${jobTitle} Interviews`} />
      <RenderInterviews jobId={Number(id)} />
    </SafeAreaView>
  );
};

export default Interviews;
