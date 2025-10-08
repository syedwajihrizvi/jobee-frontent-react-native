import { getInterviewStyle } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const Details = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderInterviewTypeIcon = (type: "ONLINE" | "IN_PERSON" | "PHONE" | string) => {
    switch (type) {
      case "ONLINE":
        return <Feather name="video" size={16} color="#6366f1" />;
      case "IN_PERSON":
        return <Feather name="map-pin" size={16} color="#ef4444" />;
      case "PHONE":
        return <Feather name="phone" size={16} color="#10b981" />;
      default:
        return <Feather name="help-circle" size={16} color="#9ca3af" />;
    }
  };
  return (
    <ScrollView className="w-full h-full px-3 py-2" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-2">
        <View
          className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4"
          style={{
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Feather name="clipboard" size={20} color="#f97316" />
        </View>

        <Text className="font-quicksand-bold text-2xl text-center text-gray-800 leading-8 mb-2">Interview Details</Text>
        <Text className="font-quicksand-medium text-sm text-center text-gray-600 leading-5">
          Review all the important information about your upcoming interview.
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
        <View className="flex-row items-center gap-3 mb-6 p-4 bg-blue-50 rounded-xl">
          <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
            <FontAwesome5 name="building" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-gray-800">
              {interviewDetails?.companyName || "Company Name"}
            </Text>
            <Text className="font-quicksand-medium text-sm text-gray-600">
              {interviewDetails?.jobTitle || "Position Title"}
            </Text>
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
              <Feather name="calendar" size={16} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-medium text-xs text-gray-500 uppercase tracking-wide">
                Interview Date
              </Text>
              <Text className="font-quicksand-semibold text-gray-800 text-base">
                {interviewDetails?.interviewDate ? formatDate(interviewDetails.interviewDate) : "Date TBD"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
              <Feather name="clock" size={16} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-medium text-xs text-gray-500 uppercase tracking-wide">
                Interview Time ({interviewDetails?.timezone || "Timezone TBD"})
              </Text>
              <Text className="font-quicksand-semibold text-gray-800 text-base">
                {interviewDetails?.startTime ? formatTime(interviewDetails.startTime) : "Start Time TBD"} -{" "}
                {interviewDetails?.endTime ? formatTime(interviewDetails.endTime) : "End Time TBD"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center">
              {renderInterviewTypeIcon(interviewDetails?.interviewType || "")}
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-medium text-xs text-gray-500 uppercase tracking-wide">
                Interview Type
              </Text>
              <Text className="font-quicksand-semibold text-gray-800 text-base">
                {getInterviewStyle(interviewDetails?.interviewType || "") || "Virtual/In-Person"}
              </Text>
            </View>
          </View>
          {interviewDetails?.location && (
            <View className="flex-row items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center">
                <Feather name="map-pin" size={16} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="font-quicksand-medium text-xs text-gray-500 uppercase tracking-wide">Location</Text>
                <Text className="font-quicksand-semibold text-gray-800 text-base">{interviewDetails.location}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View
        className="bg-amber-50 rounded-2xl p-5 border border-amber-200"
        style={{
          shadowColor: "#f59e0b",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <Feather name="alert-circle" size={18} color="#f59e0b" />
          <Text className="font-quicksand-bold text-amber-800 text-base">Important Reminders</Text>
        </View>
        <View className="gap-2">
          <View className="flex-row items-start gap-2">
            <Text className="font-quicksand-bold text-amber-700 text-xs">•</Text>
            <Text className="font-quicksand-medium text-amber-700 text-xs leading-4 flex-1">
              Arrive 10-15 minutes early (or join the call a few minutes before)
            </Text>
          </View>
          <View className="flex-row items-start gap-2">
            <Text className="font-quicksand-bold text-amber-700 text-xs">•</Text>
            <Text className="font-quicksand-medium text-amber-700 text-xs leading-4 flex-1">
              Have copies of your resume and a list of questions ready
            </Text>
          </View>
          <View className="flex-row items-start gap-2">
            <Text className="font-quicksand-bold text-amber-700 text-xs">•</Text>
            <Text className="font-quicksand-medium text-amber-700 text-xs leading-4 flex-1">
              Research the company and role thoroughly beforehand
            </Text>
          </View>
        </View>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="target" size={16} color="#22c55e" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">You&apos;re well-prepared!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          Review these details and you&apos;ll feel confident going in
        </Text>
      </View>
    </ScrollView>
  );
};

export default Details;
