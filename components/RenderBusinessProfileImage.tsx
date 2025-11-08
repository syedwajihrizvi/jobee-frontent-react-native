import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { BusinessUser } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, View } from "react-native";

type Props = {
  user: BusinessUser | null;
};

const RenderBusinessProfileImage = ({ user }: Props) => {
  if (user?.profileImageUrl)
    return (
      <Image source={{ uri: getS3BusinessProfileImage(user.profileImageUrl) }} className="w-16 h-16 rounded-full" />
    );
  return (
    <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
      <Feather name="user" size={40} color="#6b7280" />
    </View>
  );
};

export default RenderBusinessProfileImage;
