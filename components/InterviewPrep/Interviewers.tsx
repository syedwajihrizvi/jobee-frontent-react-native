import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const Interviewers = () => {
  return (
    <View className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Now lets see who will be interviewing you.
      </Text>
      <Ionicons name="people" size={48} color="#22c55e" />
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Another important aspect is to research your interviewers. Understanding
        them is as important as understanding the job and company.
      </Text>
    </View>
  );
};

export default Interviewers;
