import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileLink = ({
  icon,
  label,
  onPress,
  subtitle,
  rightIcon = true,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  subtitle?: string;
  rightIcon?: boolean;
}) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-4">
          <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center">{icon}</View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-base text-gray-800 mb-1">{label}</Text>
            {subtitle && (
              <Text className="font-quicksand-medium text-sm text-gray-500 leading-4" numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightIcon && (
          <View className="ml-3">
            <Feather name="chevron-right" size={20} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProfileLink;
