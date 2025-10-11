import React from "react";
import { Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
  items: any[];
  emptyIcon: React.ReactNode;
  emptyMessage: string;
};

const ApplicantSection = ({ children, items, emptyIcon, emptyMessage }: Props) => {
  return items && items.length > 0 ? (
    <View className="gap-3">{children}</View>
  ) : (
    <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
      {emptyIcon}
      <Text className="font-quicksand-medium text-gray-600 mt-2">{emptyMessage}</Text>
    </View>
  );
};

export default ApplicantSection;
