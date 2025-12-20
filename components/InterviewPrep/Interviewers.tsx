import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const Interviewers = () => {
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-14 h-14 bg-teal-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#14b8a6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Ionicons name="people" size={28} color="#14b8a6" />
        </View>
        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-8 mb-2">
          Know Your Interviewers
        </Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Research your interviewers beforehand. Understanding their background helps you connect better and tailor your
          responses.
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
            <Feather name="search" size={20} color="#14b8a6" />
            <Text className="font-quicksand-bold text-lg text-gray-800">Research Strategy</Text>
          </View>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-6">
            Understanding your interviewers is as important as understanding the job and company. Here is how to
            prepare:
          </Text>
        </View>
        <View className="gap-4">
          <View className="flex-row items-start gap-4 p-4 bg-blue-50 rounded-xl">
            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
              <Feather name="linkedin" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-blue-800 text-sm mb-1">LinkedIn Research</Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                Check their professional background, shared connections, and recent posts or articles they&apos;ve
                shared.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-purple-50 rounded-xl">
            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
              <FontAwesome5 name="building" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-purple-800 text-sm mb-1">Company Directory</Text>
              <Text className="font-quicksand-medium text-purple-700 text-xs leading-4">
                Look at the company website&apos;s team page to understand their role and how long they&apos;ve been
                with the company.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-emerald-50 rounded-xl">
            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
              <Feather name="message-circle" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-green-800 text-sm mb-1">Common Ground</Text>
              <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                Find shared interests, experiences, or mutual connections that could help break the ice.
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-4 p-4 bg-orange-50 rounded-xl">
            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
              <Feather name="book-open" size={16} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-orange-800 text-sm mb-1">Their Expertise</Text>
              <Text className="font-quicksand-medium text-orange-700 text-xs leading-4">
                Understand their area of expertise so you can ask relevant questions and showcase related skills.
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mb-6">
        <View className="flex-row items-center gap-2 mb-3">
          <FontAwesome5 name="lightbulb" size={16} color="#6366f1" />
          <Text className="font-quicksand-bold text-indigo-800 text-sm">Pro Tips</Text>
        </View>
        <View className="gap-2">
          <Text className="font-quicksand-medium text-indigo-700 text-xs leading-4">
            • Do NOT mention personal information you found online
          </Text>
          <Text className="font-quicksand-medium text-indigo-700 text-xs leading-4">
            • Focus on professional achievements and expertise
          </Text>
          <Text className="font-quicksand-medium text-indigo-700 text-xs leading-4">
            • Prepare thoughtful questions based on their background
          </Text>
        </View>
      </View>
      <View className="items-center">
        <View className="flex-row items-center gap-2">
          <Feather name="users" size={16} color="#14b8a6" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">Build meaningful connections!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          The more you know about them, the better you can connect
        </Text>
      </View>
    </ScrollView>
  );
};

export default Interviewers;
