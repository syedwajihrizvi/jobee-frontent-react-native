import { meetingPlatforms } from "@/constants";
import { convert11Or10DigitNumberToPhoneFormat } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import RenderMeetingPlatformIcon from "./RenderMeetingPlatformIcon";
type Props = {
  interviewDetails: InterviewDetails | null;
};

const InterviewFormatSummary = ({ interviewDetails }: Props) => {
  const getInterviewTypeIcon = (type: string) => {
    const isSelected = interviewDetails?.interviewType === type;
    const color = isSelected ? "white" : "#6b7280";

    switch (type) {
      case "IN_PERSON":
        return <Feather name="users" size={12} color={color} />;
      case "ONLINE":
        return <Feather name="video" size={12} color={color} />;
      case "PHONE":
        return <Feather name="phone" size={12} color={color} />;
      default:
        return null;
    }
  };

  const renderOnlineMeetingInfo = () => {
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

  return (
    <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <Text className="font-quicksand-bold text-base text-emerald-900 mb-2">Interview Format</Text>

      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
          {getInterviewTypeIcon(interviewDetails?.interviewType || "")}
        </View>
        <View>
          <Text className="font-quicksand-bold text-base text-emerald-900">
            {interviewDetails?.interviewType === "IN_PERSON"
              ? "In-Person Interview"
              : interviewDetails?.interviewType === "ONLINE"
                ? "Online Interview"
                : interviewDetails?.interviewType === "PHONE"
                  ? "Phone Interview"
                  : "Not specified"}
          </Text>
        </View>
      </View>
      {interviewDetails?.interviewType === "IN_PERSON" && (
        <View className="bg-white rounded-lg p-3 gap-2">
          <View>
            <Text className="font-quicksand-semibold text-sm text-emerald-700">Address</Text>
            <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
              {interviewDetails?.streetAddress || "Address not provided"}
            </Text>
          </View>
          {interviewDetails?.buildingName && (
            <View>
              <Text className="font-quicksand-semibold text-sm text-emerald-700">Building</Text>
              <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                {interviewDetails?.buildingName}
              </Text>
            </View>
          )}
          {interviewDetails?.parkingInfo && (
            <View>
              <Text className="font-quicksand-semibold text-sm text-emerald-700">Parking</Text>
              <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                {interviewDetails?.parkingInfo.trim() || "No parking information provided"}
              </Text>
            </View>
          )}
          {interviewDetails?.contactInstructionsOnArrival && (
            <View>
              <Text className="font-quicksand-semibold text-sm text-emerald-700">Instructions</Text>
              <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1">
                {interviewDetails?.contactInstructionsOnArrival.trim() || "No instructions provided"}
              </Text>
            </View>
          )}
        </View>
      )}
      {interviewDetails?.interviewType === "ONLINE" && (
        <View className="bg-white rounded-lg p-3 gap-2">
          {interviewDetails?.interviewMeetingPlatform && (
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-2">
                <RenderMeetingPlatformIcon
                  size={18}
                  active={false}
                  platformType={interviewDetails.interviewMeetingPlatform}
                  platformColor={
                    meetingPlatforms.find((p) => p.value === interviewDetails?.interviewMeetingPlatform)?.textColor ||
                    "#059669"
                  }
                />
                <Text className="font-quicksand-bold text-md text-emerald-900">
                  {meetingPlatforms.find((p) => p.value === interviewDetails?.interviewMeetingPlatform)?.label}
                </Text>
              </View>
            </View>
          )}

          <View>{renderOnlineMeetingInfo()}</View>
        </View>
      )}
      {interviewDetails?.interviewType === "PHONE" && (
        <View className="bg-white rounded-lg p-3">
          <Text className="font-quicksand-semibold text-sm text-emerald-700">Phone Number</Text>
          <Text className="font-quicksand-bold text-base text-emerald-900 mt-1">
            {convert11Or10DigitNumberToPhoneFormat(interviewDetails?.phoneNumber) || "Phone number not provided"}
          </Text>
        </View>
      )}
    </View>
  );
};

export default InterviewFormatSummary;
