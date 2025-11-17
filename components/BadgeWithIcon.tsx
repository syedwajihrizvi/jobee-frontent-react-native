import React from "react";
import { Text, View } from "react-native";

type Props = {
  text: string;
  icon: React.ReactNode;
};
const BadgeWithIcon = ({ text, icon }: Props) => {
  return (
    <View className="bg-emerald-200 px-2 py-1 rounded-lg items-center justify-center flex-row gap-2">
      {icon}
      <Text className="font-quicksand-semibold text-md text-green-800">{text}</Text>
    </View>
  );
};

export default BadgeWithIcon;
