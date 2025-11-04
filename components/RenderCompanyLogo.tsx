import { images } from "@/constants";
import { getS3CompanyLogoUrl } from "@/lib/s3Urls";
import React from "react";
import { Image } from "react-native";

type Props = {
  logoUrl: string;
};

const RenderCompanyLogo = ({ logoUrl }: Props) => {
  if (logoUrl) {
    return <Image source={{ uri: getS3CompanyLogoUrl(logoUrl) }} className="size-8 rounded-md" resizeMode="contain" />;
  }
  return <Image source={images.companyLogo} className="size-8" resizeMode="contain" />;
};

export default RenderCompanyLogo;
