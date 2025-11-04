import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ViewMore = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <View className="flex-row gap-1 items-center">
      <TouchableOpacity onPress={onClick}>
        <Text className="font-quicksand-semibold text-md underline">{label}</Text>
      </TouchableOpacity>
      <Feather name="arrow-right" size={16} color="black" className="mt-1" />
    </View>
  );
};

export default ViewMore;
