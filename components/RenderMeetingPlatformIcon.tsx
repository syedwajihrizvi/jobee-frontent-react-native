import { platformLogos } from "@/constants";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Image } from "react-native";

type Props = {
  platformType: string;
  platformColor: string;
  active: boolean;
  size?: number;
};

const RenderMeetingPlatformIcon = ({ platformType, platformColor, active, size = 16 }: Props) => {
  if (platformType === "ZOOM") {
    return <Image source={platformLogos.ZOOM} style={{ width: size, height: size, borderRadius: 4 }} />;
  }
  if (platformType === "GOOGLE_MEET") {
    return <Image source={platformLogos.GOOGLE_MEET} style={{ width: size, height: size, borderRadius: 4 }} />;
  }
  if (platformType === "MICROSOFT_TEAMS") {
    return <FontAwesome5 name="microsoft" size={size} color={active ? platformColor : "#FFF"} />;
  }
  if (platformType === "SKYPE") {
    return <FontAwesome5 name="skype" size={size} color={active ? platformColor : "#FFF"} />;
  }
  if (platformType === "WEBEX") {
    return <Image source={platformLogos.WEBEX} style={{ width: size, height: size, borderRadius: 4 }} />;
  }
  if (platformType === "CODERPAD") {
    return <Image source={platformLogos.CODERPAD} style={{ width: size, height: size, borderRadius: 4 }} />;
  }
  if (platformType === "CODESIGNAL") {
    return <Image source={platformLogos.CODESIGNAL} style={{ width: size, height: size, borderRadius: 4 }} />;
  }
  if (platformType === "OTHER") {
    return <FontAwesome5 name="link" size={size} color={active ? platformColor : "#FFF"} />;
  }

  return <FontAwesome5 name="link" size={size} color={active ? platformColor : "#FFF"} />;
};

export default RenderMeetingPlatformIcon;
