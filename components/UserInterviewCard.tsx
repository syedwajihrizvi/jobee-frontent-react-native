import { convertTo12Hour, getInterviewStyle } from "@/lib/utils";
import { InterviewSummary } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CompanyInformation from "./CompanyInformation";

type Props = {
  item: InterviewSummary;
  withPadding?: boolean;
};

const UserInterviewCard = ({ item, withPadding = true }: Props) => {
  return (
    <TouchableOpacity
      className={`${withPadding ? "mx-4" : ""} mb-4 bg-white rounded-2xl p-5 border border-gray-100`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
      activeOpacity={0.7}
      onPress={() => router.push(`/userProfile/interviews/${item.id}`)}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <CompanyInformation companyName={item.companyName} companyLogoUrl={""} />
        </View>
        <View
          className="bg-indigo-100 px-3 py-1 rounded-full"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="font-quicksand-bold text-xs text-indigo-700">{item.interviewDate}</Text>
        </View>
      </View>
      <View className="mb-4">
        <Text className="font-quicksand-bold text-xl text-gray-900 mb-2">{item.jobTitle}</Text>
        <View className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <Text className="font-quicksand-bold text-base text-gray-800 mb-1">{item.title}</Text>
          <Text className="font-quicksand-medium text-sm text-gray-600 leading-5" numberOfLines={2}>
            {item.description}
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
            {convertTo12Hour(item.startTime)} - {convertTo12Hour(item.endTime)}
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
          <Text className="font-quicksand-semibold text-xs text-blue-800">{item.timezone}</Text>
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
            name={item.interviewType === "ONLINE" ? "video" : item.interviewType === "PHONE" ? "phone" : "users"}
            size={12}
            color="#7c3aed"
          />
          <Text className="font-quicksand-semibold text-xs text-purple-800">
            {getInterviewStyle(item.interviewType)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 bg-emerald-500 rounded-full"></View>
          <Text className="font-quicksand-medium text-sm text-gray-600">Interview scheduled</Text>
        </View>
        <View
          className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Feather name="chevron-right" size={16} color="#6366f1" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserInterviewCard;
