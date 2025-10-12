import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  color: string;
  shadowColor: string;
  handlePress: () => void;
  count: number;
  label: string;
};
const ActionButton = ({ color, shadowColor, handlePress, count, label }: Props) => {
  return (
    <View>
      <TouchableOpacity
        className={`${color} rounded-xl px-4 py-3 items-center min-w-[100px]`}
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
        <Text className="font-quicksand-bold text-xs text-white">{count}</Text>
        <Text className="font-quicksand-semibold text-xs text-white">{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButton;
