import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const CheckList = ({ items }: { items: string[] }) => {
  return (
    <View className="p-4 border border-gray-300 rounded-lg mt-2">
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
