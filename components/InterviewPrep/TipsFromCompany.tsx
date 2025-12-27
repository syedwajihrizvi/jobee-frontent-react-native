import { InterviewPreparation } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import CheckList from "../CheckList";

const TipsFromCompany = ({ interviewPrep }: { interviewPrep: InterviewPreparation }) => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-14 h-14 bg-orange-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="message-square" size={28} color="#f97316" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-8 mb-2">
          Company&apos;s Interview Tips
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          The company has provided specific guidance to help you succeed in this interview. Follow these recommendations
          carefully.
        </Text>
      </View>
      <View
        className="bg-white rounded-2xl p-5 border border-gray-100 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center justify-center gap-3">
          <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
            <Text className="font-quicksand-bold text-orange-600 text-lg">
              {interviewPrep?.notesFromInterviewer?.length || 0}
            </Text>
          </View>
          <Text className="font-quicksand-semibold text-gray-700 text-base">
            Tip{(interviewPrep?.notesFromInterviewer?.length || 0) > 1 ? "s" : ""} from the Company
          </Text>
        </View>
      </View>
      <View>
        {interviewPrep?.notesFromInterviewer && interviewPrep.notesFromInterviewer.length > 0 ? (
          <View
            className="bg-white rounded-2xl p-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <CheckList items={interviewPrep.notesFromInterviewer} withBorder={false} />
          </View>
        ) : (
          <View
            className="bg-gray-50 rounded-2xl p-8 border border-gray-200 my-4"
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
                <Feather name="message-square" size={28} color="#9ca3af" />
              </View>
              <Text className="font-quicksand-bold text-gray-600 text-lg text-center mb-2">No Specific Tips Yet</Text>
              <Text className="font-quicksand-medium text-gray-500 text-sm text-center leading-5">
                The company has not provided specific interview tips yet. Check back later or contact your recruiter for
                more information.
              </Text>
            </View>
          </View>
        )}
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <View className="flex-row items-center gap-2 mb-3">
            <Feather name="info" size={16} color="#3b82f6" />
            <Text className="font-quicksand-bold text-blue-800 text-sm">Why These Tips Matter</Text>
          </View>
          <Text className="font-quicksand-medium text-blue-700 text-xs leading-4 mb-2">
            Company-specific tips give you insider knowledge about what the interviewers are looking for. They often
            include:
          </Text>
          <View className="gap-1 ml-3">
            <Text className="font-quicksand-medium text-blue-700 text-xs">
              • Key skills or qualities they prioritize
            </Text>
            <Text className="font-quicksand-medium text-blue-700 text-xs">• Company culture insights</Text>
            <Text className="font-quicksand-medium text-blue-700 text-xs">• Specific interview format details</Text>
          </View>
        </View>
      </View>
      <View className="items-center mt-4">
        <View className="flex-row items-center gap-2">
          <Feather name="star" size={16} color="#f97316" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">Follow their guidance!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          These tips come directly from the people who will interview you
        </Text>
      </View>
    </ScrollView>
  );
};

export default TipsFromCompany;
