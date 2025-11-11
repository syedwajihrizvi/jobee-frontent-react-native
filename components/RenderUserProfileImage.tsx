import { getS3ProfileImage } from "@/lib/s3Urls";
import { User } from "@/type";
import React from "react";
import { Image, Text, View } from "react-native";

type Props = {
  user?: User | undefined;
  profileImageUrl?: string;
  profileImageSize?: number;
  fontSize?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
};

const RenderUserProfileImage = ({
  user,
  profileImageUrl,
  profileImageSize = 16,
  fontSize = 12,
  firstName,
  lastName,
  fullName,
}: Props) => {
  const imgUrl = user?.profileImageUrl || profileImageUrl || null;
  let fn = user?.firstName || firstName || "";
  let ln = user?.lastName || lastName || "";
  if (fullName && (!firstName || !lastName)) {
    const nameParts = fullName.split(" ");
    fn = nameParts[0];
    ln = nameParts.length > 1 ? nameParts[1] : "";
  }
  if (imgUrl != null)
    return (
      <Image
        source={{ uri: getS3ProfileImage(imgUrl) }}
        className={`w-${profileImageSize} h-${profileImageSize} rounded-full`}
      />
    );
  return (
    <View className={`w-${fontSize} h-${fontSize} bg-blue-100 rounded-full items-center justify-center`}>
      <Text className="font-quicksand-bold text-blue-600 text-sm">
        {fn.charAt(0)}
        {ln.charAt(0)}
      </Text>
    </View>
  );
};

export default RenderUserProfileImage;
