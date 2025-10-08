import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const AnalyzeCandidate = () => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center">
            <Ionicons name="person-circle" size={20} color="white" />
          </View>
        </View>

        <Text className="font-quicksand-bold text-2xl text-center text-gray-800 leading-9 mb-2">
          Let&apos;s Analyze You as a Candidate
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Understanding your strengths and areas for improvement is crucial for interview success
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl p-6 border border-gray-100 mb-8"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="items-center mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Feather name="target" size={20} color="#22c55e" />
            <Text className="font-quicksand-bold text-lg text-gray-800">Self-Assessment Strategy</Text>
          </View>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-6">
            This analysis will help you identify what sets you apart from other candidates and areas where you can
            improve your positioning.
          </Text>
        </View>
        <View className="gap-4">
          <View className="flex-row items-start gap-4 p-4 bg-green-50 rounded-xl">
            <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
              <Feather name="trending-up" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-green-800 text-sm mb-1">Your Strengths</Text>
              <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                Identify your unique value proposition and competitive advantages that make you stand out.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
              <Feather name="book-open" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-blue-800 text-sm mb-1">Skill Alignment</Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                How well your experience and skills match what the company is looking for.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-amber-50 rounded-xl">
            <View className="w-8 h-8 bg-amber-500 rounded-full items-center justify-center">
              <Feather name="alert-triangle" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-amber-800 text-sm mb-1">Areas to Address</Text>
              <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
                Potential gaps or concerns that might come up during the interview.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-purple-50 rounded-xl">
            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
              <Feather name="users" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-purple-800 text-sm mb-1">Cultural Fit</Text>
              <Text className="font-quicksand-medium text-purple-700 text-xs leading-4">
                How your values and work style align with the company culture.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
        <View className="flex-row items-center gap-2 mb-2">
          <FontAwesome5 name="lightbulb" size={16} color="#6366f1" />
          <Text className="font-quicksand-bold text-indigo-800 text-sm">Why This Matters</Text>
        </View>
        <Text className="font-quicksand-medium text-indigo-700 text-xs leading-4">
          Knowing your positioning helps you craft compelling answers, address concerns proactively, and present
          yourself as the ideal candidate for this specific role.
        </Text>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="award" size={16} color="#22c55e" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">Know your worth!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          Understanding yourself is the first step to interview confidence
        </Text>
      </View>
    </ScrollView>
  );
};

export default AnalyzeCandidate;
