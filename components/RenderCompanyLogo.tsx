import { images } from "@/constants";
import { getS3CompanyLogoUrl } from "@/lib/s3Urls";
import React from "react";
import { Image } from "react-native";

type Props = {
  logoUrl: string;
  size?: number;
};

const RenderCompanyLogo = ({ logoUrl, size = 8 }: Props) => {
  if (logoUrl) {
    return (
      <Image
        source={{ uri: getS3CompanyLogoUrl(logoUrl) }}
        className={`size-${size} rounded-md`}
        resizeMode="contain"
      />
    );
  }
  return <Image source={images.companyLogo} className={`size-${size}`} resizeMode="contain" />;
};

export default RenderCompanyLogo;
