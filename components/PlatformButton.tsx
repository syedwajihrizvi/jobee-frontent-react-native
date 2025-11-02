import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  bgColor: string;
  textColor: string;
  label: string;
  onPress: () => void;
  isSelected: boolean;
  icon: React.ReactElement<{ color?: string }>;
};

const PlatformButton = ({ label, onPress, icon, bgColor, textColor, isSelected }: Props) => {
  return (
    <TouchableOpacity
      className={`flex-row gap-2 px-3 py-2 rounded-lg items-center relative ${
        isSelected ? "border-2" : "border border-transparent"
      }`}
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? textColor : bgColor,
        borderColor: isSelected ? textColor : "transparent",
        shadowColor: isSelected ? textColor : "#000",
        shadowOffset: { width: 0, height: isSelected ? 3 : 1 },
        shadowOpacity: isSelected ? 0.3 : 0.1,
        shadowRadius: isSelected ? 6 : 2,
        elevation: isSelected ? 4 : 2,
      }}
      activeOpacity={0.8}
    >
      {isSelected && (
        <View className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center border-2 border-white">
          <Feather name="check" size={10} color="white" />
        </View>
      )}
      <View style={{ opacity: isSelected ? 0.9 : 1 }}>
        {React.isValidElement(icon) &&
          React.cloneElement(icon, {
            color: isSelected ? bgColor : textColor,
          })}
      </View>

      <Text
        className={`font-quicksand-semibold text-sm ${isSelected ? "font-quicksand-bold" : ""}`}
        style={{ color: isSelected ? bgColor : textColor }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default PlatformButton;
