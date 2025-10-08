import { InterviewPreparation } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import VerticalAnimatedList from "../VerticalAnimatedList";

const Strengths = ({ interviewPrep }: { interviewPrep: InterviewPreparation }) => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="star" size={20} color="#22c55e" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-9 mb-4">Your Key Strengths</Text>
        <View className="bg-green-50 rounded-xl p-4 border border-green-200">
          <View className="flex-row items-center gap-2 mb-2">
            <Feather name="target" size={16} color="#22c55e" />
            <Text className="font-quicksand-bold text-green-800 text-sm">Interview Strategy</Text>
          </View>
          <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
            Remember to highlight these strengths during your interview. Use specific examples and stories to
            demonstrate each one.
          </Text>
        </View>
      </View>

      <View
        className="bg-white rounded-2xl p-5 border border-gray-100 mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center justify-center gap-3">
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
            <Text className="font-quicksand-bold text-green-600 text-lg">{interviewPrep?.strengths?.length || 0}</Text>
          </View>
          <Text className="font-quicksand-semibold text-gray-700 text-base">
            Key Strength{(interviewPrep?.strengths?.length || 0) > 1 ? "s" : ""} Identified
          </Text>
        </View>
      </View>
      <View className="flex-1">
        {interviewPrep?.strengths && interviewPrep.strengths.length > 0 ? (
          <View
            className="bg-white rounded-2xl p-3 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <VerticalAnimatedList listItems={interviewPrep.strengths} />
          </View>
        ) : (
          <View
            className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="items-center">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Feather name="star" size={28} color="#9ca3af" />
              </View>
              <Text className="font-quicksand-bold text-gray-600 text-lg text-center mb-2">
                Analyzing Your Strengths
              </Text>
              <Text className="font-quicksand-medium text-gray-500 text-sm text-center leading-5">
                We&apos;re still analyzing your profile to identify your key strengths. This information will be
                available shortly.
              </Text>
            </View>
          </View>
        )}
      </View>
      <View className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <View className="flex-row items-center gap-2 mb-2">
          <FontAwesome5 name="lightbulb" size={16} color="#3b82f6" />
          <Text className="font-quicksand-bold text-blue-800 text-sm">Pro Tips for Highlighting Strengths</Text>
        </View>
        <View className="gap-1 ml-3">
          <Text className="font-quicksand-medium text-blue-700 text-xs">
            • Use the STAR method (Situation, Task, Action, Result)
          </Text>
          <Text className="font-quicksand-medium text-blue-700 text-xs">
            • Quantify your achievements when possible
          </Text>
          <Text className="font-quicksand-medium text-blue-700 text-xs">
            • Connect your strengths to the job requirements
          </Text>
        </View>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="award" size={16} color="#22c55e" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">You&apos;ve got this!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          These strengths set you apart from other candidates
        </Text>
      </View>
    </ScrollView>
  );
};

export default Strengths;
