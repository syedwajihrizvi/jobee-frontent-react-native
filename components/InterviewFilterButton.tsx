import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  handlePress: () => void;
  count: number;
  label: string;
  isActive: boolean;
  iconName: keyof typeof Feather.glyphMap;
  iconColor: string;
  theme: string;
  shadowColor: string;
};

const InterviewFilterButton = ({
  handlePress,
  count,
  label,
  isActive,
  iconName,
  iconColor,
  theme,
  shadowColor,
}: Props) => {
  const renderButtonClass = () => {
    if (!isActive) {
      return `bg-white border border-${theme}-300 px-3 py-2 rounded-xl flex-row items-center gap-2`;
    }
    return `bg-${theme}-100 border border-${theme}-300 px-3 py-2 rounded-xl flex-row items-center gap-2`;
  };

  return (
    <TouchableOpacity
      className={renderButtonClass()}
      style={{
        shadowColor: shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Feather name={iconName} size={12} color={iconColor} />
      <Text className={`font-quicksand-bold text-${theme}-800 text-xs`}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );
};

export default InterviewFilterButton;
