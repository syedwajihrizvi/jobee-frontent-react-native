import { getS3CompanyLogoUrl } from "@/lib/s3Urls";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Image } from "react-native";

type Props = {
  logoUrl?: string;
  size?: number;
};

const RenderCompanyLogo = ({ logoUrl, size = 4 }: Props) => {
  const sizeInPixels = size * 8;

  if (logoUrl) {
    return (
      <Image
        source={{ uri: getS3CompanyLogoUrl(logoUrl) }}
        className="rounded-md"
        style={{ width: sizeInPixels, height: sizeInPixels }}
        resizeMode="contain"
      />
    );
  } else {
    return <FontAwesome5 name="building" size={sizeInPixels * 0.6} color="#22c55e" />;
  }
};

export default RenderCompanyLogo;
