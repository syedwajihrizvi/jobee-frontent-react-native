import { renderInterviewType } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const Conducted = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  const getInterviewIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "phone":
        return "phone";
      case "online":
        return "video";
      case "in_person":
        return "map-pin";
      default:
        return "users";
    }
  };

  const getInterviewColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "phone":
        return { bg: "bg-blue-100", text: "text-blue-600", icon: "#3b82f6" };
      case "video":
      case "virtual":
        return { bg: "bg-purple-100", text: "text-purple-600", icon: "#8b5cf6" };
      case "in-person":
      case "onsite":
        return { bg: "bg-green-100", text: "text-green-600", icon: "#22c55e" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", icon: "#6b7280" };
    }
  };

  const interviewType = interviewDetails?.interviewType || "";
  const colors = getInterviewColor(interviewType);

  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-8">
        <View
          className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="settings" size={20} color="#6366f1" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-8 mb-2">Interview Format</Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-6 px-4">
          Understanding how your interview will be conducted is crucial for optimal preparation and performance.
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
          <View
            className={`w-12 h-12 ${colors.bg} rounded-full items-center justify-center mb-4`}
            style={{
              shadowColor: colors.icon,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Feather name={getInterviewIcon(interviewType)} size={20} color={colors.icon} />
          </View>

          <Text className="font-quicksand-bold text-lg text-gray-800 mb-2 text-center">Your Interview Type</Text>
          <Text className={`font-quicksand-bold text-md ${colors.text} text-center`}>
            {renderInterviewType(interviewDetails?.interviewType)}
          </Text>
        </View>

        <View className="gap-4">
          {interviewType?.toLowerCase() === "phone" && (
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <View className="flex-row items-center gap-3 mb-3">
                <Feather name="phone" size={18} color="#3b82f6" />
                <Text className="font-quicksand-bold text-blue-800 text-base">Phone Interview Setup</Text>
              </View>
              <View className="gap-2">
                <Text className="font-quicksand-medium text-blue-700 text-sm">
                  📞 <Text className="font-quicksand-semibold">Phone Number:</Text>{" "}
                  {interviewDetails?.phoneNumber || "Will be provided"}
                </Text>
                <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                  • Find a quiet space with good reception
                </Text>
                <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                  • Have your resume and notes ready
                </Text>
                <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                  • Test your phone beforehand
                </Text>
              </View>
            </View>
          )}

          {interviewType?.toLowerCase() === "online" && (
            <View className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <View className="flex-row items-center gap-3 mb-3">
                <Feather name="video" size={18} color="#8b5cf6" />
                <Text className="font-quicksand-bold text-purple-800 text-base">Video Interview Setup</Text>
              </View>
              <View className="gap-2">
                <Text className="font-quicksand-medium text-purple-700 text-sm">
                  🔗 <Text className="font-quicksand-semibold">Meeting Link:</Text>{" "}
                  {interviewDetails?.meetingLink || "Will be provided"}
                </Text>
                <Text className="font-quicksand-medium text-purple-700 text-xs leading-4">
                  • Test your camera and microphone
                </Text>
                <Text className="font-quicksand-medium text-purple-700 text-xs leading-4">
                  • Ensure stable internet connection
                </Text>
                <Text className="font-quicksand-medium text-purple-700 text-xs leading-4">
                  • Set up proper lighting and background
                </Text>
              </View>
            </View>
          )}
          {interviewType?.toLowerCase() === "in_person" && (
            <View className="bg-green-50 rounded-xl p-4 border border-green-200">
              <View className="flex-row items-center gap-3 mb-3">
                <Feather name="map-pin" size={18} color="#22c55e" />
                <Text className="font-quicksand-bold text-green-800 text-base">In-Person Interview Location</Text>
              </View>
              <View className="gap-2">
                <Text className="font-quicksand-medium text-green-700 text-sm">
                  📍 <Text className="font-quicksand-semibold">Address:</Text>{" "}
                  {interviewDetails?.location || "Will be provided"}
                </Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                  • Plan your route and parking in advance
                </Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                  • Arrive 10-15 minutes early
                </Text>
                <Text className="font-quicksand-medium text-green-700 text-xs leading-4">
                  • Dress professionally and bring copies of your resume
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        className="bg-indigo-500 py-4 rounded-xl flex-row items-center justify-center mb-6"
        style={{
          shadowColor: "#6366f1",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
        onPress={() => console.log("Test interview setup")}
        activeOpacity={0.8}
      >
        <Feather name="check-circle" size={20} color="white" />
        <Text className="font-quicksand-bold text-white text-lg ml-2">Test My Setup</Text>
      </TouchableOpacity>
      <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="alert-triangle" size={16} color="#f59e0b" />
          <Text className="font-quicksand-bold text-amber-800 text-sm">Important</Text>
        </View>
        <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
          The interview format can significantly impact your performance. Make sure you&apos;re well-prepared for the
          specific type of interview you&apos;ll be having.
        </Text>
      </View>
    </ScrollView>
  );
};

export default Conducted;
