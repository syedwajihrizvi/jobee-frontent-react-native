import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

const OnlineMeetingInfo = ({ interviewDetails }: { interviewDetails: InterviewDetails }) => {
  const { onlineMeetingInformation, interviewMeetingPlatform } = interviewDetails!;
  if (!onlineMeetingInformation || !interviewMeetingPlatform) {
    return (
      <Text className="font-quicksand-medium text-sm text-emerald-900">No online meeting information provided</Text>
    );
  }
  {
    /* Add more platform types */
  }
  if (interviewMeetingPlatform === "ZOOM") {
    return (
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Feather name="hash" size={16} color="#10B981" />
          <Text className="font-quicksand-semibold text-md text-emerald-900">
            Meeting ID:{" "}
            <Text className="font-quicksand-semibold text-emerald-700">{onlineMeetingInformation.meetingId}</Text>
          </Text>
        </View>
        {onlineMeetingInformation.meetingPassword && (
          <View className="flex-row gap-2 items-center">
            <Feather name="lock" size={16} color="#10B981" />
            <Text className="font-quicksand-semibold text-md text-emerald-900">
              Password:{" "}
              <Text className="font-quicksand-semibold text-emerald-700">
                {onlineMeetingInformation.meetingPassword}
              </Text>
            </Text>
            <TouchableOpacity onPress={() => Clipboard.setStringAsync(onlineMeetingInformation.meetingPassword)}>
              <Feather name="copy" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        )}
        {interviewDetails?.status === "SCHEDULED" && (
          <TouchableOpacity
            className="bg-emerald-500 rounded-md p-2 mt-2 w-60 flex-row items-center justify-center gap-2"
            onPress={() => Linking.openURL(onlineMeetingInformation.joinUrl)}
          >
            <Feather name="video" size={16} color="white" />
            <Text className="font-quicksand-bold text-sm text-white">Join Zoom Meeting</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  if (interviewMeetingPlatform === "GOOGLE_MEET") {
    return (
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Feather name="hash" size={16} color="#10B981" />
          <Text className="font-quicksand-semibold text-md text-emerald-900">
            Meeting ID:{" "}
            <Text className="font-quicksand-semibold text-emerald-700">{onlineMeetingInformation.meetingId}</Text>
          </Text>
        </View>
        {interviewDetails?.status === "SCHEDULED" && (
          <TouchableOpacity
            className="bg-emerald-500 rounded-md p-2 mt-2 w-60 flex-row items-center justify-center gap-2"
            onPress={() => Linking.openURL(onlineMeetingInformation.hangoutLink)}
          >
            <Feather name="video" size={16} color="white" />
            <Text className="font-quicksand-bold text-sm text-white">Join Google Meet</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
};

export default OnlineMeetingInfo;
