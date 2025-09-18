import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const EditProfileCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <View className="flex-grow min-w-[45%] p-4 rounded-2xl bg-white shadow-md border border-gray-100 flex-row justify-between items-start">
      <View>
        <Text className="font-quicksand-semibold text-md">{label}</Text>
        <Text
          className="font-quicksand text-sm text-gray-900"
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      <TouchableOpacity>
        <Feather name="edit" size={14} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileCard;
