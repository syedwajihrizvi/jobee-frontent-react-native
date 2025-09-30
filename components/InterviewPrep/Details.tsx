import { Octicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const Details = () => {
  return (
    <View key={2} className="w-full h-full items-center justify-start gap-10">
      <Text className="font-quicksand-bold text-2xl text-center">
        Let&apos;s begin with the interview details. Be sure to review this
        important information.
      </Text>
      <Octicons name="checklist" size={48} color="#22c55e" />
      <Text className="font-quicksand-semibold text-xl mb-4 text-center">
        No matter how obvious something might be, it is always good to review
        the details. This will help you avoid any surprises on the day of the
        interview. Preparation is key to succeeding in an interview.
      </Text>
    </View>
  );
};

export default Details;
