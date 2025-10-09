import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  text: string;
  handlePress: () => void;
};

const RemovableBadge = ({ text, handlePress }: Props) => {
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View
        className="bg-emerald-100 border border-emerald-200 px-3 py-2 items-center justify-center flex-row rounded-full"
        style={{
          shadowColor: "#10b981",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text className="text-emerald-800 font-quicksand-medium text-sm mr-2">{text}</Text>
        <View
          className="w-4 h-4 bg-emerald-200 rounded-full items-center justify-center border border-emerald-300"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 1,
            elevation: 1,
          }}
        >
          <Feather name="x" size={10} color="#059669" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RemovableBadge;
