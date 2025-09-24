import { useInterviewPrep } from "@/lib/services/useInterviewPrep";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Prep = () => {
  const { id: interviewId } = useLocalSearchParams();
  const { data, isLoading, error } = useInterviewPrep({
    interviewId: Number(interviewId),
  });
  console.log(data);
  return (
    <SafeAreaView>
      <Text>{interviewId}</Text>
    </SafeAreaView>
  );
};

export default Prep;
