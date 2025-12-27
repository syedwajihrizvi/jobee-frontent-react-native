import { mapTimezoneValueToLabel } from "@/constants";
import {
  convertTo12Hour,
  getDecisionString,
  getDecisionStyle,
  getInterviewStyle,
  interviewStatusStyles,
} from "@/lib/utils";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RenderUserProfileImage from "./RenderUserProfileImage";

type Props = {
  interview: InterviewDetails;
  handlePress: () => void;
};

const InterviewCard = ({ interview, handlePress }: Props) => {
  const { getInterviewStatus } = useBusinessInterviewsStore();

  const renderInterviewDecision = (decision: string) => {
    const decisionStyle = getDecisionStyle(decision);
    const { bgColor, textColor, shadowColor } = decisionStyle;
    const decisionString = getDecisionString(decision);
    return (
      <View
        className={`${bgColor} px-3 py-1 rounded-full`}
        style={{
          shadowColor: shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text className={`font-quicksand-bold text-xs ${textColor}`}>{decisionString}</Text>
      </View>
    );
  };

  const renderInterviewStatus = (status: string) => {
    const style =
      interviewStatusStyles[status as keyof typeof interviewStatusStyles] || interviewStatusStyles["SCHEDULED"];
    return (
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-2">
          <View className={`w-2 h-2 ${style.bgColor} rounded-full`}></View>
          <Text className="font-quicksand-medium text-sm text-gray-600">{style.text}</Text>
        </View>
        <View
          className={`w-8 h-8 ${style.chevronColor} rounded-full items-center justify-center`}
          style={{
            shadowColor: style.chevronShadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Feather name="chevron-right" size={16} color={style.chevronHexaColor} />
        </View>
      </View>
    );
  };

  const renderInterviewDate = () => {
    if (interview.status === "COMPLETED") {
      return (
        <View
          className="bg-red-100 px-3 py-1 rounded-full"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="font-quicksand-semibold text-xs text-red-700">Completed {interview.interviewDate}</Text>
        </View>
      );
    }
    return (
      <View
        className="bg-emerald-100 px-3 py-1 rounded-full"
        style={{
          shadowColor: "#6366f1",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text className="font-quicksand-semibold text-xs text-emerald-700">{interview.interviewDate}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      className="mb-2 bg-white rounded-lg p-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View className="flex-row items-center gap-2 mb-1">
        <RenderUserProfileImage
          profileImageUrl={interview.candidateProfileImageUrl}
          profileImageSize={8}
          fontSize={8}
          fullName={interview.candidateName}
        />
        <View className="flex-1">
          <Text className="font-quicksand-bold text-base text-gray-900">
            {interview?.candidateName || "Candidate Name"}
          </Text>
          <View className="flex-row items-center gap-1">
            <Feather name="briefcase" size={10} color="#6b7280" />
            <Text className="font-quicksand-medium text-xs text-gray-600">Job Applicant</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between mb-2">
          {interview.status === "COMPLETED" &&
            interview.decisionResult &&
            renderInterviewDecision(interview.decisionResult)}
        </View>
      </View>
      <Text className="font-quicksand-bold text-sm text-gray-900 mb-1">{interview.jobTitle}</Text>
      <View className="flex-row flex-wrap gap-1 mb-2">
        {renderInterviewDate()}
        <View className="bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-xl flex-row items-center gap-1">
          <Feather name="clock" size={10} color="#059669" />
          <Text className="font-quicksand-semibold text-xs text-emerald-800">
            {convertTo12Hour(interview.startTime)} - {convertTo12Hour(interview.endTime)}
          </Text>
        </View>
        <View className="bg-blue-100 border border-blue-200 px-2 py-1 rounded-xl flex-row items-center gap-1">
          <Feather name="globe" size={10} color="#2563eb" />
          <Text className="font-quicksand-semibold text-xs text-blue-800">
            {mapTimezoneValueToLabel(interview.timezone)}
          </Text>
        </View>
        <View className="bg-purple-100 border border-purple-200 px-2 py-1 rounded-xl flex-row items-center gap-1">
          <Feather
            name={
              interview.interviewType === "ONLINE" ? "video" : interview.interviewType === "PHONE" ? "phone" : "users"
            }
            size={10}
            color="#7c3aed"
          />
          <Text className="font-quicksand-semibold text-xs text-purple-800">
            {getInterviewStyle(interview.interviewType)}
          </Text>
        </View>
      </View>
      {renderInterviewStatus(getInterviewStatus(interview.id) || interview.status)}
    </TouchableOpacity>
  );
};

export default InterviewCard;
