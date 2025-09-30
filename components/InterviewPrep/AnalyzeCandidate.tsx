import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const AnalyzeCandidate = () => {
  return (
    <View className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">Good, now lets analyze you as a candidate.</Text>
      <Ionicons name="person-circle" size={48} color="#22c55e" />
      <Text className="font-quicksand-semibold text-lg text-center">
        Understanding yourself as a candidate is as important as understanding the job. This will help you determine
        what can push you ahead of other candidates and what areas you need to improve on.
      </Text>
    </View>
  );
};

export default AnalyzeCandidate;
