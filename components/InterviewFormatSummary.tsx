import { meetingPlatforms } from "@/constants";
import { convert11Or10DigitNumberToPhoneFormat } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
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

  return (
    <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <Text className="font-quicksand-bold text-base text-emerald-900 mb-3">Interview Format</Text>

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
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="font-quicksand-semibold text-sm text-emerald-700">Platform:</Text>
              <View className="flex-row items-center gap-2">
                <RenderMeetingPlatformIcon
                  active={false}
                  platformType={interviewDetails.interviewMeetingPlatform}
                  platformColor={
                    meetingPlatforms.find((p) => p.value === interviewDetails?.interviewMeetingPlatform)?.textColor ||
                    "#059669"
                  }
                />
                <Text className="font-quicksand-bold text-sm text-emerald-900">
                  {meetingPlatforms.find((p) => p.value === interviewDetails?.interviewMeetingPlatform)?.label}
                </Text>
              </View>
            </View>
          )}

          <View>
            <Text className="font-quicksand-semibold text-md text-emerald-700">Meeting Link</Text>
            <Text className="font-quicksand-medium text-sm text-emerald-900 mt-1" numberOfLines={2}>
              {interviewDetails?.meetingLink || "Meeting link not provided"}
            </Text>
          </View>
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
