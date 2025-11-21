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
  let textSize = "sm";
  if (fontSize > 12) {
    textSize = "md";
  }
  if (fontSize >= 16) {
    textSize = "lg";
  } else if (fontSize >= 20) {
    textSize = "xl";
  } else if (fontSize >= 24) {
    textSize = "2xl";
  } else if (fontSize >= 30) {
    textSize = "3xl";
  }
  if (imgUrl != null)
    return (
      <Image
        source={{ uri: getS3ProfileImage(imgUrl) }}
        className={`w-${profileImageSize} h-${profileImageSize} rounded-full`}
        style={{
          resizeMode: "cover",
        }}
      />
    );
  return (
    <View className={`w-${fontSize} h-${fontSize} bg-emerald-100 rounded-full items-center justify-center`}>
      <Text className={`font-quicksand-bold text-emerald-600 text-${textSize}`}>
        {fn.charAt(0)}
        {ln.charAt(0)}
      </Text>
    </View>
  );
};

export default RenderUserProfileImage;
