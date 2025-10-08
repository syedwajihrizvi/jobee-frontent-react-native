import { renderQuestionSteps } from "@/lib/utils";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const QuestionsIntro = () => {
  return (
    <View className="w-full h-full px-3 py-4">
      <View className="items-center mb-4">
        <View
          className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="help-circle" size={20} color="#10b981" />
        </View>

        <Text className="font-quicksand-bold text-2xl text-center text-gray-800 leading-9 mb-2">
          Practice Interview Questions
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          It is time to practice answering questions that could come up during this interview. Follow these steps for
          effective preparation.
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
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
            <Feather name="list" size={16} color="#10b981" />
          </View>
          <Text className="font-quicksand-bold text-lg text-gray-800">Practice Strategy</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          style={{ maxHeight: 300 }}
        >
          <View className="gap-4">
            {renderQuestionSteps.map((step, index) => (
              <View
                key={index}
                className="flex-row items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
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
                  <Text className="font-quicksand-bold text-white text-sm">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-emerald-800 text-sm leading-6">{step}</Text>
                </View>
                <View className="w-6 h-6 border-2 border-emerald-300 rounded-full items-center justify-center">
                  <Feather name="check" size={12} color="#10b981" />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <View className="flex-row items-center gap-2 mb-2">
          <FontAwesome5 name="lightbulb" size={16} color="#3b82f6" />
          <Text className="font-quicksand-bold text-blue-800 text-sm">Pro Tip</Text>
        </View>
        <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
          Practice your answers out loud, not just in your head. This helps you articulate your thoughts more clearly
          during the actual interview.
        </Text>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="target" size={16} color="#10b981" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">You are almost ready!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          Practice makes perfect - let us get you interview-ready
        </Text>
      </View>
    </View>
  );
};

export default QuestionsIntro;
