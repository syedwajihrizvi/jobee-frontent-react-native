import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  color: string;
  shadowColor: string;
  handlePress: () => void;
  icon: ReactNode;
  label: string;
};
const ActionButton = ({ color, shadowColor, handlePress, icon, label }: Props) => {
  return (
    <View>
      <TouchableOpacity
        className={`${color} flex-row gap-2 justify-center rounded-xl px-4 py-3 items-center min-w-[100px]`}
        style={{
          shadowColor: shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {icon}
        <Text className="font-quicksand-semibold text-xs text-white">View {label}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButton;
