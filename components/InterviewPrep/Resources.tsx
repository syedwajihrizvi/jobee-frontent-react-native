import React from "react";
import { Text, View } from "react-native";

const Resources = () => {
  return (
    <View key={12} className="w-full h-full items-center justify-start">
      <Text className="font-quicksand-bold text-2xl text-center">
        Now take some time to review the resources on the next slide.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center mt-4">
        These have been curated specifically for this interview to help you improve your interview skills and boost your
        confidence. I highly recommend going over these before moving on to practice questions.
      </Text>
    </View>
  );
};

export default Resources;
