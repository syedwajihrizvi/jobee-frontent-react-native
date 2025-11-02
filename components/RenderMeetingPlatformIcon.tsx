import { platformLogos } from "@/constants";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Image } from "react-native";

type Props = {
  platformType: string;
  platformColor: string;
};

const RenderMeetingPlatformIcon = ({ platformType, platformColor }: Props) => {
  if (platformType === "ZOOM") {
    return <Image source={platformLogos.ZOOM} style={{ width: 20, height: 20, borderRadius: 4 }} />;
  }
  if (platformType === "GOOGLE_MEET") {
    return <Image source={platformLogos.GOOGLE_MEET} style={{ width: 20, height: 20, borderRadius: 4 }} />;
  }
  if (platformType === "MICROSOFT_TEAMS") {
    return <FontAwesome5 name="microsoft" size={16} color={platformColor} />;
  }
  if (platformType === "SKYPE") {
    return <FontAwesome5 name="skype" size={16} color={platformColor} />;
  }
  if (platformType === "WEBEX") {
    return <Image source={platformLogos.WEBEX} style={{ width: 20, height: 20, borderRadius: 4 }} />;
  }
  if (platformType === "CODERPAD") {
    return <Image source={platformLogos.CODERPAD} style={{ width: 20, height: 20, borderRadius: 4 }} />;
  }
  if (platformType === "CODESIGNAL") {
    return <Image source={platformLogos.CODESIGNAL} style={{ width: 20, height: 20, borderRadius: 4 }} />;
  }
  if (platformType === "OTHER") {
    return <FontAwesome5 name="link" size={16} color={platformColor} />;
  }

  return <FontAwesome5 name="link" size={16} color={platformColor} />;
};

export default RenderMeetingPlatformIcon;
