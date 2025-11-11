import { formatDate } from "@/lib/utils";
import { Conversation } from "@/type";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RenderBusinessProfileImage from "./RenderBusinessProfileImage";
import RenderSlicedText from "./RenderSlicedText";
import RenderUserProfileImage from "./RenderUserProfileImage";

type Props = {
  message: Conversation;
};

// TODO: Update how we get the profile iamge url since it differs for business and user
const MessagePreviewCard = ({ message }: Props) => {
  const renderProfileImageUrl = () => {
    if (message.participantRole === "BUSINESS") {
      return (
        <RenderBusinessProfileImage
          profileImageUrl={message.participantProfileImageUrl}
          profileImageSize={12}
          fontSize={14}
          firstName={message.participantName.split(" ")[0]}
          lastName={message.participantName.split(" ")[1]}
        />
      );
    }
    return (
      <RenderUserProfileImage
        profileImageSize={12}
        profileImageUrl={message.participantProfileImageUrl}
        fontSize={14}
        firstName={message.participantName.split(" ")[0]}
        lastName={message.participantName.split(" ")[1]}
      />
    );
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
          `/messages/${message.participantId}?name=${message.participantName}&role=${message.participantRole}&conversationId=${message.id}&profileImageUrl=${message.participantProfileImageUrl}`
        )
      }
      activeOpacity={0.8}
    >
      <View className="flex-row items-start gap-3">
        <View className="relative">
          {renderProfileImageUrl()}
          <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-quicksand-bold text-base text-gray-900">{message.participantName}</Text>
            <Text className="font-quicksand-medium text-xs text-gray-500">
              {formatDate(message.lastMessageTimestamp)}
            </Text>
          </View>
          <RenderSlicedText
            text={message.lastMessageContent}
            maxLength={88}
            textClassName="text-gray-600 leading-5"
            withFormatting={false}
          />
        </View>
        {!message.wasLastMessageSender && (
          <View className="items-center gap-2">
            {!message.lastMessageRead && <View className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MessagePreviewCard;
