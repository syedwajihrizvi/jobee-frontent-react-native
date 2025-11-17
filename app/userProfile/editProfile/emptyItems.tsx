import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  subTitle: string;
  buttonText: string;
  handlePress: () => void;
};

const EmptyItems = ({ title, subTitle, buttonText, handlePress }: Props) => {
  return (
    <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
      <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
        <Feather name="award" size={24} color="#9ca3af" />
      </View>
      <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">{title}</Text>
      <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">{subTitle}</Text>
      <TouchableOpacity className="bg-emerald-500 px-6 py-3 rounded-xl" onPress={handlePress}>
        <Text className="font-quicksand-semibold text-white text-sm">{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyItems;
