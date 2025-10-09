import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  optionalThirdItem?: React.ReactNode;
  optionalCallback?: () => void;
};

const BackBar = ({ label, optionalThirdItem, optionalCallback = () => {} }: Props) => {
  const handlePress = () => {
    optionalCallback();
    router.back();
  };
  return (
    <View className="flex-row w-full justify-between items-center px-4">
      <TouchableOpacity onPress={handlePress}>
        <AntDesign name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold ">{label}</Text>
      {optionalThirdItem ? optionalThirdItem : <View style={{ width: 24 }} />}
    </View>
  );
};

export default BackBar;
