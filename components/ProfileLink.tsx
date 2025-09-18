import { Entypo } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileLink = ({
  icon,
  label,
  onPress,
  rightIcon = true,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  rightIcon?: boolean;
}) => {
  return (
    <TouchableOpacity
      className="flex flex-row items-center w-full p-2"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="ml-2 font-quicksand-bold text-lg">{label}</Text>
      </View>
      {rightIcon && (
        <Entypo
          name="chevron-right"
          size={20}
          color="black"
          className="ml-auto"
        />
      )}
    </TouchableOpacity>
  );
};

export default ProfileLink;
