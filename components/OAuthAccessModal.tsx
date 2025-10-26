import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const OAuthAccessModal = () => {
  return (
    <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-quicksand-bold text-blue-900 text-sm">Select from Google Drive</Text>
        <TouchableOpacity className="px-3 py-1 bg-blue-500 rounded-lg" activeOpacity={0.8}>
          <Text className="font-quicksand-bold text-white text-xs">Browse</Text>
        </TouchableOpacity>
      </View>

      {/* Sample Drive files - replace with actual API data */}
      <View className="gap-2">
        <TouchableOpacity className="bg-white rounded-lg p-3 flex-row items-center gap-3" activeOpacity={0.7}>
          <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center">
            <Feather name="file-text" size={14} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-semibold text-gray-900 text-sm">My Resume 2024.pdf</Text>
            <Text className="font-quicksand-medium text-gray-500 text-xs">Modified 2 days ago</Text>
          </View>
          <Feather name="download" size={16} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-lg p-3 flex-row items-center gap-3" activeOpacity={0.7}>
          <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center">
            <Feather name="file-text" size={14} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-semibold text-gray-900 text-sm">Cover Letter Template.docx</Text>
            <Text className="font-quicksand-medium text-gray-500 text-xs">Modified 1 week ago</Text>
          </View>
          <Feather name="download" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OAuthAccessModal;
