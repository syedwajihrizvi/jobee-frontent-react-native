import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const Resources = () => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="book-open" size={20} color="#6366f1" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-9 mb-2">
          Curated Learning Resources
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Take some time to review these carefully selected resources designed specifically for your upcoming interview
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl p-6 border border-gray-100 mb-4"
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
            <Feather name="target" size={20} color="#6366f1" />
            <Text className="font-quicksand-bold text-lg text-gray-800">Why These Resources Matter</Text>
          </View>
          <Text className="font-quicksand-semibold text-base text-center text-gray-700 leading-6 mb-4">
            These have been curated specifically for this interview to help you improve your skills and boost your
            confidence.
          </Text>
          <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-5">
            I highly recommend going over these before moving on to practice questions.
          </Text>
        </View>
        <View className="gap-4">
          <View className="flex-row items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
              <Feather name="zap" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-blue-800 text-sm mb-1">Boost Your Confidence</Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                Build confidence through targeted preparation and proven strategies.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-emerald-50 rounded-xl">
            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
              <Feather name="trending-up" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-green-800 text-sm mb-1">Improve Your Skills</Text>
              <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                Learn advanced techniques and best practices for interview success.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-purple-50 rounded-xl">
            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
              <Feather name="star" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-purple-800 text-sm mb-1">Stand Out From Others</Text>
              <Text className="font-quicksand-medium text-purple-700 text-xs leading-4">
                Learn what makes candidates memorable and impressive to interviewers.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="clock" size={16} color="#f59e0b" />
          <Text className="font-quicksand-bold text-amber-800 text-sm">Time Investment</Text>
        </View>
        <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
          Spend 15-30 minutes reviewing these resources. Quality preparation leads to interview success and better
          outcomes.
        </Text>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="bookmark" size={16} color="#6366f1" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">Knowledge is power!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          The more prepared you are, the more confident you will feel
        </Text>
      </View>
    </ScrollView>
  );
};

export default Resources;
