import { capFirstLetter } from "@/lib/utils";
import React from "react";
import { Text } from "react-native";

const RenderSlicedText = ({
  text,
  maxLength,
  textClassName,
}: {
  text: string;
  maxLength: number;
  textClassName?: string;
}) => {
  const formatted = capFirstLetter(text);
  return (
    <Text className={`font-quicksand-regular text-sm ${textClassName}`}>
      {formatted.length > maxLength ? `${formatted.slice(0, maxLength)}...` : formatted}
    </Text>
  );
};

export default RenderSlicedText;
