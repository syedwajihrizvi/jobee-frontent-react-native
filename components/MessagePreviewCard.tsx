import { images } from "@/constants";
import { formatDate } from "@/lib/utils";
import { MessagePreview } from "@/type";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import RenderSlicedText from "./RenderSlicedText";

type Props = {
  message: MessagePreview;
};

const MessagePreviewCard = ({ message }: Props) => {
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
      onPress={() => router.push(`/messages/${message.id}?name=${message.from}`)}
      activeOpacity={0.8}
    >
      <View className="flex-row items-start gap-3">
        <View className="relative">
          <Image
            source={{ uri: images.companyLogo }}
            className="w-12 h-12 rounded-full border-2 border-gray-200"
            resizeMode="cover"
          />
          <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-quicksand-bold text-base text-gray-900">{message.from}</Text>
            <Text className="font-quicksand-medium text-xs text-gray-500">{formatDate(message.dateReceived)}</Text>
          </View>
          <RenderSlicedText text={message.content} maxLength={100} textClassName="text-gray-600 leading-5" />
        </View>
        <View className="items-center gap-2">
          {message.read && <View className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MessagePreviewCard;
