import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  handleEditPress: () => void;
};

const ProfileCard = ({ label, subtitle, icon, handleEditPress }: Props) => {
  return (
    <View
      className="bg-white rounded-xl p-4 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-4">
          {icon && <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">{icon}</View>}
          <View className="flex-1">
            <Text className="font-quicksand-bold text-base text-gray-800 mb-1">{label}</Text>
            <Text className="font-quicksand-medium text-sm text-gray-500 leading-4" numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="ml-3" onPress={handleEditPress}>
          <Feather name="edit" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileCard;
