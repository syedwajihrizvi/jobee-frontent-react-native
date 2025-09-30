import { renderQuestionSteps } from "@/lib/utils";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const QuestionsIntro = () => {
  return (
    <View key={13} className="w-full h-full items-center flex-col gap-4 justify-center">
      <Text className="font-quicksand-bold text-2xl text-center">
        It is time to practice answering questions that could come up during this interview.
      </Text>
      <ScrollView className="w-full max-w-sm">
        {renderQuestionSteps.map((step, index) => (
          <View
            key={index}
            className="flex-row items-start gap-3 mb-4 p-3 bg-gray-50 rounded-xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
              <Text className="font-quicksand-bold text-sm text-white">{index + 1}</Text>
            </View>
            <Text className="font-quicksand-medium text-sm flex-1 leading-5 mt-0.5">{step}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuestionsIntro;
