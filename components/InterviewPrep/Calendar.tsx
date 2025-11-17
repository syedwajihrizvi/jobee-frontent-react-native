import { convertTo12Hour } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const Calendar = ({ interviewDetails }: { interviewDetails: InterviewDetails | undefined }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="calendar" size={24} color="#22c55e" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-8 mb-4">Schedule Reminder</Text>
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
        <View className="items-center mb-3">
          <Text className="font-quicksand-bold text-lg text-gray-800 mb-2">Your interview is scheduled for</Text>
          <View className="bg-emerald-50 rounded-xl p-4 mb-4 w-full border border-green-200">
            <View className="flex-row items-center justify-center gap-2 mb-2">
              <Feather name="calendar" size={18} color="#22c55e" />
              <Text className="font-quicksand-bold text-green-800 text-md">
                {interviewDetails?.interviewDate ? formatDate(interviewDetails.interviewDate) : "Date TBD"}
              </Text>
            </View>
            <View className="flex-row items-center justify-center gap-2">
              <Feather name="clock" size={16} color="#22c55e" />
              <Text className="font-quicksand-semibold text-green-700 text-base">
                {interviewDetails?.startTime ? convertTo12Hour(interviewDetails.startTime) : "Time TBD"}{" "}
                {interviewDetails?.timezone || ""} -{" "}
                {interviewDetails?.endTime ? convertTo12Hour(interviewDetails.endTime) : "Time TBD"}{" "}
                {interviewDetails?.timezone || ""}
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <View className="flex-row items-center gap-2 mb-3">
            <Feather name="bell" size={16} color="#3b82f6" />
            <Text className="font-quicksand-bold text-blue-800 text-sm">We&apos;ll help you stay prepared</Text>
          </View>
          <Text className="font-quicksand-medium text-blue-700 text-sm leading-5">
            Be ready 15 minutes before your interview. We&apos;ll add this to your calendar and send you reminders:
          </Text>

          <View className="mt-3 gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="font-quicksand-medium text-blue-700 text-xs">1 day before the interview</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="font-quicksand-medium text-blue-700 text-xs">1 hour before the interview</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="font-quicksand-medium text-blue-700 text-xs">15 minutes before the interview</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-4">
        <TouchableOpacity
          className="bg-emerald-500 py-4 rounded-xl flex-row items-center justify-center"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => console.log("Add to calendar and set notification")}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={20} color="white" />
          <Text className="font-quicksand-semibold text-white text-md ml-2">Help me Remember</Text>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <View className="flex-row items-center gap-2 mb-2">
          <FontAwesome5 name="lightbulb" size={16} color="#f59e0b" />
          <Text className="font-quicksand-bold text-amber-800 text-sm">Pro Tip</Text>
        </View>
        <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
          Set up your interview space and test your technology beforehand. Having everything ready will help you feel
          more confident.
        </Text>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="check-circle" size={16} color="#22c55e" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">You&apos;re almost ready!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          Just one more step to ensure you don&apos;t miss your interview
        </Text>
      </View>
    </ScrollView>
  );
};

export default Calendar;
