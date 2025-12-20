import { interviewPrepChecklist } from "@/constants";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const Introduction = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center mb-4"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Feather name="briefcase" size={28} color="#21c55e" />
        </View>

        <Text className="font-quicksand-bold text-2xl text-center text-gray-800 leading-8">Interview Preparation</Text>
        <Text className="font-quicksand-semibold text-lg text-center text-green-600 mt-2">
          {interviewDetails?.companyName}
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 mt-1 leading-5">
          Let&apos;s get you fully prepared and confident for your upcoming interview!
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl p-6 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="gap-4">
          {interviewPrepChecklist.map((item, index) => (
            <View key={index} className="flex-row items-start gap-4 p-3 bg-gray-50 rounded-xl">
              <View
                className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="font-quicksand-bold text-white text-sm">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-gray-800 text-sm leading-6">{item}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <View className="flex-row items-center gap-2 mb-2">
            <Feather name="info" size={16} color="#3b82f6" />
            <Text className="font-quicksand-bold text-blue-800 text-sm">Pro Tip</Text>
          </View>
          <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
            Take your time with each step. Quality preparation leads to confident interviews and better outcomes.
          </Text>
        </View>
      </View>
      <View className="items-center mt-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="star" size={16} color="#fbbf24" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">You&apos;ve got this!</Text>
          <Feather name="star" size={16} color="#fbbf24" />
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center">
          Follow this checklist to maximize your interview success
        </Text>
      </View>
    </ScrollView>
  );
};

export default Introduction;
