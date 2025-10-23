import { getS3BusinessProfileImage, getS3ProfileImage } from "@/lib/s3Urls";
import { formatDate } from "@/lib/utils";
import { Conversation } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import RenderSlicedText from "./RenderSlicedText";

type Props = {
  message: Conversation;
};

// TODO: Update how we get the profile iamge url since it differs for business and user
const MessagePreviewCard = ({ message }: Props) => {
  const renderProfileImageUrl = () => {
    if (message.participantRole === "BUSINESS") {
      return getS3BusinessProfileImage(message.participantProfileImageUrl);
    }
    return getS3ProfileImage(message.participantProfileImageUrl);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={() =>
        router.push(
          `/messages/${message.participantId}?name=${message.participantName}&role=${message.participantRole}&conversationId=${message.id}`
        )
      }
      activeOpacity={0.8}
    >
      <View className="flex-row items-start gap-3">
        <View className="relative">
          {message.participantProfileImageUrl ? (
            <Image
              source={{ uri: renderProfileImageUrl() }}
              className="w-12 h-12 rounded-full border-2 border-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-full border-2 border-gray-200 items-center justify-center bg-gray-100">
              <Feather name="user" size={30} color="black" />
            </View>
          )}
          <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-quicksand-bold text-base text-gray-900">{message.participantName}</Text>
            <Text className="font-quicksand-medium text-xs text-gray-500">
              {formatDate(message.lastMessageTimestamp)}
            </Text>
          </View>
          <RenderSlicedText text={message.lastMessageContent} maxLength={88} textClassName="text-gray-600 leading-5" />
        </View>
        {message.wasLastMessageSender && (
          <View className="items-center gap-2">
            {message.lastMessageRead && <View className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MessagePreviewCard;
