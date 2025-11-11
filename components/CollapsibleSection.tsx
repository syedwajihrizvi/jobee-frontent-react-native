import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const CollapsibleSection = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  iconColor = "#6b7280",
}: {
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  iconColor?: string;
}) => (
  <View
    className="bg-white rounded-2xl p-5 border border-gray-100 mb-4"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">{icon}</View>
          <Text className="font-quicksand-semibold text-lg text-gray-900">{title}</Text>
        </View>
        <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
          <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#6b7280" />
        </View>
      </View>
    </TouchableOpacity>
    {isOpen && <View className="mt-4 pt-4 border-t border-gray-100">{children}</View>}
  </View>
);

export default CollapsibleSection;
