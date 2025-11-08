import { images } from "@/constants";
import { getS3CompanyLogoUrl } from "@/lib/s3Urls";
import React from "react";
import { Image } from "react-native";

type Props = {
  logoUrl: string;
  size?: number;
};

const RenderCompanyLogo = ({ logoUrl, size = 4 }: Props) => {
  const sizeInPixels = size * 8; // Assuming 1 unit = 8 pixels
  if (logoUrl) {
    return (
      <Image
        source={{ uri: getS3CompanyLogoUrl(logoUrl) }}
        className="rounded-md"
        style={{ width: sizeInPixels, height: sizeInPixels }}
        resizeMode="contain"
      />
    );
  }
  return (
    <Image source={images.companyLogo} resizeMode="contain" style={{ width: sizeInPixels, height: sizeInPixels }} />
  );
};

export default RenderCompanyLogo;
