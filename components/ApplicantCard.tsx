import { images } from "@/constants";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { formatDate, getApplicationStatus } from "@/lib/utils";
import { ApplicationSummary } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: ApplicationSummary;
  isShortListed: boolean;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
    case "SHORTLISTED":
      return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" };
    case "INTERVIEWED_SCHEDULED":
      return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" };
    case "REJECTED":
      return { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
  }
};

const ApplicantCard = ({ item, isShortListed }: Props) => {
  const statusColors = getStatusColor(item.status);
  return (
    <TouchableOpacity
      className="bg-white mx-4 mb-4 rounded-2xl p-5 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
      activeOpacity={0.7}
      onPress={() => router.push(`/businessJobs/applications/applicant/${item.id}`)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-start gap-4 flex-1">
          <View
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Image
              source={{
                uri: item.profileImageUrl ? getS3ProfileImage(item.profileImageUrl) : images.companyLogo,
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1 mr-3">
            <Text className="font-quicksand-bold text-lg text-gray-900">{item.fullName}</Text>
            <Text className="font-quicksand-semibold text-base text-gray-700">{item.title}</Text>
            <View className="flex-row items-center gap-1">
              <Feather name="map-pin" size={14} color="#6b7280" />
              <Text className="font-quicksand-medium text-sm text-gray-600">{item.location}</Text>
            </View>
          </View>
        </View>
        <View className="items-end gap-2">
          {isShortListed && (
            <View className="bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
              <View className="flex-row items-center gap-1">
                <Feather name="star" size={12} color="#f59e0b" />
                <Text className="font-quicksand-bold text-xs text-amber-800">Shortlisted</Text>
              </View>
            </View>
          )}
          <View className={`${statusColors.bg} ${statusColors.border} border px-3 py-1 rounded-full`}>
            <Text className={`font-quicksand-bold text-xs ${statusColors.text}`}>
              {getApplicationStatus(item.status)}
            </Text>
          </View>
        </View>
      </View>
      <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
        <Text className="font-quicksand-bold text-sm text-gray-900 mb-2">Professional Summary</Text>
        <Text className="font-quicksand-medium text-sm text-gray-700 leading-5" numberOfLines={3}>
          {item.profileSummary || "No summary provided by the applicant."}
        </Text>
      </View>
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-2">
          <Feather name="calendar" size={14} color="#6b7280" />
          <Text className="font-quicksand-medium text-sm text-gray-600">Applied on {formatDate(item.appliedAt)}</Text>
        </View>
        <View
          className="w-8 h-8 bg-green-100 rounded-full items-center justify-center"
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

export default ApplicantCard;
