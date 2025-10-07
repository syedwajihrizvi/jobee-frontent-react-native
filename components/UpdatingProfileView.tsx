import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const UpdatingProfileView = () => {
  return (
    <View className="flex-1 items-center justify-center gap-4 pt-4">
      <ActivityIndicator size="large" color="#22c55e" />
      <Text className="font-quicksand-semibold text-lg">Updating Profile Information...</Text>
    </View>
  );
};

export default UpdatingProfileView;
