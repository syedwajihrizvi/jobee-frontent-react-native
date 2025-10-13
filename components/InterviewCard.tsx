import { images } from "@/constants";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { convertTo12Hour, getDecisionString, getInterviewStyle, interviewStatusStyles } from "@/lib/utils";
import { InterviewDetails } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  interview: InterviewDetails;
  handlePress: () => void;
};

const InterviewCard = ({ interview, handlePress }: Props) => {
  const renderInterviewDecision = (decision: string) => {
    const decisionString = getDecisionString(decision);
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
        <Text className="font-quicksand-bold text-xs text-emerald-700">{decisionString}</Text>
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
          <Feather name="chevron-right" size={16} color="#6366f1" />
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View className="flex-row items-center justify-between mb-4">
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
          <Text className="font-quicksand-bold text-xs text-emerald-700">{interview.interviewDate}</Text>
        </View>
        {renderInterviewDecision(interview.decisionResult)}
      </View>
      <View className="flex-row items-start gap-4">
        <View
          className="w-8 h-8 rounded-full overflow-hidden border-3 border-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Image
            source={{
              uri: interview?.candidateProfileImageUrl
                ? getS3ProfileImage(interview.candidateProfileImageUrl)
                : images.companyLogo,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1 -top-1">
          <Text className="font-quicksand-bold text-lg text-gray-900">
            {interview?.candidateName || "Candidate Name"}
          </Text>
          <View className="flex-row items-center gap-1">
            <Feather name="briefcase" size={12} color="#6b7280" />
            <Text className="font-quicksand-medium text-sm text-gray-600">Job Applicant</Text>
          </View>
        </View>
      </View>
      <View className="mb-4">
        <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">{interview.jobTitle}</Text>
        <View className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <Text className="font-quicksand-bold text-base text-gray-800 mb-1">{interview.title}</Text>
          <Text className="font-quicksand-medium text-sm text-gray-600 leading-5" numberOfLines={2}>
            {interview.description}
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2 mb-3">
        <View
          className="bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl flex-row items-center gap-1"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Feather name="clock" size={12} color="#059669" />
          <Text className="font-quicksand-semibold text-xs text-emerald-800">
            {convertTo12Hour(interview.startTime)} - {convertTo12Hour(interview.endTime)}
          </Text>
        </View>
        <View
          className="bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl flex-row items-center gap-1"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Feather name="globe" size={12} color="#2563eb" />
          <Text className="font-quicksand-semibold text-xs text-blue-800">{interview.timezone}</Text>
        </View>
        <View
          className="bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl flex-row items-center gap-1"
          style={{
            shadowColor: "#8b5cf6",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Feather
            name={
              interview.interviewType === "ONLINE" ? "video" : interview.interviewType === "PHONE" ? "phone" : "users"
            }
            size={12}
            color="#7c3aed"
          />
          <Text className="font-quicksand-semibold text-xs text-purple-800">
            {getInterviewStyle(interview.interviewType)}
          </Text>
        </View>
      </View>
      {renderInterviewStatus(interview.status)}
    </TouchableOpacity>
  );
};

export default InterviewCard;
