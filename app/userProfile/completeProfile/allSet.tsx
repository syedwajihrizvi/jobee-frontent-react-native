import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  isSubmitting: boolean;
  handleDone: () => void;
};

const AllSet = ({ isSubmitting, handleDone }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-start px-6">
        <View
          className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-8"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center">
            <Feather name="check" size={40} color="white" />
          </View>
        </View>

        <View className="items-center mb-8">
          <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-4">You&apos;re All Set! 🎉</Text>
          <View className="items-center gap-4">
            <Text className="text-center font-quicksand-medium text-gray-600 text-md leading-6">
              With your updated profile, you&apos;re ready to explore job opportunities tailored just for you. You can
              quick apply, get discovered by top companies, and take the next step in your career journey.
            </Text>
            <Text className="text-center font-quicksand-medium text-gray-500 text-base leading-5">
              You can always update your profile information later from your profile settings.
            </Text>
          </View>
        </View>
        <View
          className="bg-white rounded-2xl p-6 mb-8 w-full border border-gray-200"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="font-quicksand-bold text-gray-800 text-center text-lg mb-4">What happens next?</Text>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Feather name="zap" size={16} color="#3b82f6" />
              </View>
              <Text className="font-quicksand-medium text-gray-700 text-sm flex-1">
                AI processes your resume and extracts key information
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                <Feather name="user-plus" size={16} color="#8b5cf6" />
              </View>
              <Text className="font-quicksand-medium text-gray-700 text-sm flex-1">
                Your profile becomes visible to potential employers
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                <Feather name="target" size={16} color="#22c55e" />
              </View>
              <Text className="font-quicksand-medium text-gray-700 text-sm flex-1">
                Start receiving personalized job recommendations
              </Text>
            </View>
          </View>
        </View>

        <View className="w-full">
          <TouchableOpacity
            className={`py-4 rounded-xl items-center justify-center ${isSubmitting ? "bg-gray-400" : "bg-green-500"}`}
            style={{
              shadowColor: isSubmitting ? "#9ca3af" : "#22c55e",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={handleDone}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator size="small" color="white" />
                <Text className="font-quicksand-bold text-white text-lg">Setting Up Your Profile...</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold text-white text-lg">Get Started</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View className="mt-4 items-center">
            <Text className="font-quicksand-medium text-gray-500 text-sm text-center">
              This may take a few moments to process
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AllSet;
