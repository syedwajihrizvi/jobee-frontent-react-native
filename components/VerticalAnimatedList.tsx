import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const VerticalAnimatedList = ({
  listItems,
  theme = "success",
}: {
  listItems: string[];
  theme?: "success" | "danger";
}) => {
  const [currIndex, setCurrIndex] = useState(0);
  return (
    <View className="w-full mt-2">
      <View
        className="bg-white rounded-xl shadow-md mb-3 p-2 h-[100px] border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-start gap-3">
          <Feather name="check-circle" size={18} color={theme === "success" ? "#22c55e" : "#ef4444"} />
          <Text className="font-quicksand-medium text-gray-800 text-sm leading-5 flex-1">{listItems[currIndex]}</Text>
        </View>
      </View>
      <Text className="text-center font-quicksand-semibold text-gray-600 mb-2">
        {currIndex + 1} of {listItems.length}
      </Text>
      <View className="flex-row items-center justify-center gap-4">
        <TouchableOpacity disabled={currIndex === 0} onPress={() => setCurrIndex((prev) => Math.max(prev - 1, 0))}>
          <Feather name="arrow-left-circle" size={24} color={currIndex === 0 ? "gray" : "black"} />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={currIndex === (listItems.length || 1) - 1}
          onPress={() => setCurrIndex((prev) => Math.min(prev + 1, (listItems.length || 1) - 1))}
        >
          <Feather
            name="arrow-right-circle"
            size={24}
            color={currIndex === (listItems.length || 1) - 1 ? "gray" : "black"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerticalAnimatedList;
