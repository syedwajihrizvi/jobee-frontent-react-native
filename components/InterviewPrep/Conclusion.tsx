import { interviewPrepChecklist } from "@/constants";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const Conclusion = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-8">
        <View
          className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="check-circle" size={28} color="#10b981" />
        </View>

        <Text className="font-quicksand-bold text-2xl text-center text-gray-800 leading-9 mb-2">Congratulations!</Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          You have completed your comprehensive interview preparation. Do not stop here, keep practicing and refining
          your skills.
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Your can always re-review your interview prep. Good luck with your interview at{" "}
          {interviewDetails?.companyName}!
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl p-6 border border-gray-100 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center gap-3 mb-6">
          <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
            <Feather name="award" size={16} color="#10b981" />
          </View>
          <Text className="font-quicksand-bold text-lg text-gray-800">What You have Accomplished</Text>
        </View>

        <View className="gap-4">
          {interviewPrepChecklist.map((item, index) => (
            <View
              key={index}
              className="flex-row items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
            >
              <View
                className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Feather name="check" size={14} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-emerald-800 text-sm leading-6">{item}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View className="bg-blue-50 rounded-xl p-5 border border-blue-200 mb-6">
        <View className="flex-row items-center gap-2 mb-3">
          <Feather name="clock" size={16} color="#3b82f6" />
          <Text className="font-quicksand-bold text-blue-800 text-base">Final Reminders</Text>
        </View>
        <View className="gap-2">
          <Text className="font-quicksand-medium text-blue-700 text-sm leading-5">
            • Arrive 10-15 minutes early to your interview
          </Text>
          <Text className="font-quicksand-medium text-blue-700 text-sm leading-5">
            • Bring multiple copies of your resume
          </Text>
          <Text className="font-quicksand-medium text-blue-700 text-sm leading-5">
            • Have thoughtful questions ready for your interviewers
          </Text>
          <Text className="font-quicksand-medium text-blue-700 text-sm leading-5">
            • Stay confident and be yourself!
          </Text>
        </View>
      </View>
      <View className="gap-4 mb-6">
        <TouchableOpacity
          className="bg-white py-3 rounded-xl flex-row items-center justify-center border-2 border-emerald-500"
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="share" size={16} color="#10b981" />
          <Text className="font-quicksand-semibold text-emerald-600 text-base ml-2">Exit Prep</Text>
        </TouchableOpacity>
      </View>
      <View className="items-center">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="star" size={18} color="#fbbf24" />
          <Text className="font-quicksand-bold text-gray-700 text-base">You are Interview Ready!</Text>
          <Feather name="star" size={18} color="#fbbf24" />
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-sm text-center leading-5 px-4">
          Trust in your preparation and showcase your unique value. We believe in you!
        </Text>
      </View>
    </ScrollView>
  );
};

export default Conclusion;
