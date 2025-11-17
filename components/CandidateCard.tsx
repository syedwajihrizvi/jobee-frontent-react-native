import { getS3ProfileImage } from "@/lib/s3Urls";
import { CandidateForJob } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: CandidateForJob;
  handleCandidateCardPress: () => void;
};

const CandidateCard = ({ item, handleCandidateCardPress }: Props) => {
  const getMatchConfig = (matchScore: number) => {
    if (matchScore >= 90)
      return {
        bgColor: "bg-emerald-100",
        borderColor: "border-emerald-300",
        textColor: "text-emerald-700",
        icon: "star",
        label: "Excellent",
      };
    if (matchScore >= 75)
      return {
        bgColor: "bg-emerald-100",
        borderColor: "border-green-300",
        textColor: "text-green-700",
        icon: "thumbs-up",
        label: "Great",
      };
    if (matchScore >= 60)
      return {
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-300",
        textColor: "text-yellow-700",
        icon: "check-circle",
        label: "Good",
      };
    if (matchScore >= 40)
      return {
        bgColor: "bg-orange-100",
        borderColor: "border-orange-300",
        textColor: "text-orange-700",
        icon: "alert-circle",
        label: "Fair",
      };
    return {
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      textColor: "text-red-700",
      icon: "x-circle",
      label: "Low",
    };
  };

  const matchConfig = getMatchConfig(item.matchScore || 0);

  return (
    <TouchableOpacity
      className="bg-white mx-2 rounded-xl p-4 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={handleCandidateCardPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center gap-3">
        {item.profileImageUrl ? (
          <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200">
            <Image
              source={{
                uri: item.profileImageUrl ? getS3ProfileImage(item.profileImageUrl) : "https://via.placeholder.com/150",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View className="w-12 h-12 rounded-full border-2 border-gray-200 items-center justify-center bg-gray-100">
            <Feather name="user" size={30} color="black" />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-quicksand-bold text-base text-gray-900">{item.fullName}</Text>
              <Text className="font-quicksand-medium text-sm text-gray-600">{item.title || "No title specified"}</Text>
              <View className="flex-row items-center gap-1">
                <Feather name="map-pin" size={12} color="#6b7280" />
                <Text className="font-quicksand-medium text-xs text-gray-500">
                  {item.location || "Location not specified"}
                </Text>
              </View>
            </View>
            <View
              className={`${matchConfig.bgColor} ${matchConfig.borderColor} border rounded-xl px-2 py-1 items-center min-w-[60px]`}
            >
              <View className="flex-row items-center gap-1 mb-1">
                <Text className={`font-quicksand-bold text-sm ${matchConfig.textColor}`}>{item.matchScore || 0}%</Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <View className="w-5 h-5 bg-blue-100 rounded-full items-center justify-center">
                  <MaterialIcons name="auto-awesome" size={12} color="#3b82f6" />
                </View>
                <Text className="font-quicksand-medium text-xs text-blue-600">AI Matched</Text>
              </View>

              <View className="flex-row items-center gap-1">
                <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center">
                  <Feather name="user-plus" size={10} color="#10b981" />
                </View>
                <Text className="font-quicksand-medium text-xs text-emerald-600">Available</Text>
              </View>
            </View>
            <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
              <Feather name="chevron-right" size={14} color="#6b7280" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CandidateCard;
