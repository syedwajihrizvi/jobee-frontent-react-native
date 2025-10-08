import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  items: string[];
  withBorder?: boolean;
};

const CheckList = ({ items, withBorder = true }: Props) => {
  return (
    <View className={`p-4 rounded-lg mt-2 ${withBorder ? "border border-gray-300" : ""}`}>
      {items.map((note, index) => (
        <View key={index} className="flex flex-row items-start mb-2">
          <Feather name="check-square" size={12} color="green" className="mt-1 mr-2" />
          <Text className="font-quicksand-semibold text-md flex-shrink">{note}</Text>
        </View>
      ))}
    </View>
  );
};

export default CheckList;
