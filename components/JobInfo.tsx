import { Job } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

const JobInfo = ({ job }: { job: Job }) => {
  // Mock data for demonstration - replace with actual job properties
  const mockData = {
    aiSummary: [
      "Competitive salary range with comprehensive benefits package",
      "Opportunity to work with cutting-edge technologies and frameworks",
      "Collaborative team environment with mentorship opportunities",
      "Flexible work arrangements with remote work options",
      "Professional development budget and learning opportunities",
    ],
  };

  const openMapWithAddress = () => {
    const encodedAddress = encodeURIComponent(job?.location || "San Francisco, CA");
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });

    Linking.openURL(url!);
  };

  return (
    <View className="flex-1 px-4">
      <View className="py-4 border-t border-gray-100">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-6 h-6 bg-purple-100 rounded-lg items-center justify-center">
            <MaterialIcons name="auto-awesome" size={14} color="#8b5cf6" />
          </View>
          <Text className="font-quicksand-bold text-base text-gray-900">AI Job Insights</Text>
          <View className="bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
            <Text className="font-quicksand-bold text-xs text-purple-700">AI</Text>
          </View>
        </View>
        <View className="gap-2">
          {mockData.aiSummary.map((insight, index) => (
            <View key={index} className="flex-row items-start gap-2">
              <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mt-0.5">
                <Feather name="check" size={10} color="#10b981" />
              </View>
              <Text className="font-quicksand-medium text-sm text-gray-700 flex-1 leading-5">{insight}</Text>
            </View>
          ))}
        </View>
      </View>
      <View className="py-4 border-t border-gray-100">
        <View className="flex-row items-center gap-2 mb-3">
          <Feather name="map-pin" size={16} color="#3b82f6" />
          <Text className="font-quicksand-bold text-base text-gray-900">Location</Text>
        </View>

        <Text className="font-quicksand-medium text-sm text-gray-600 mb-3">{job?.location || "San Francisco, CA"}</Text>
        <TouchableOpacity
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center"
          activeOpacity={0.8}
          onPress={openMapWithAddress}
        >
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
            <Feather name="map" size={20} color="#3b82f6" />
          </View>
          <Text className="font-quicksand-semibold text-sm text-gray-700 mb-1">View on Map</Text>
          <Text className="font-quicksand-medium text-xs text-gray-500 text-center">
            See location and nearby amenities
          </Text>
        </TouchableOpacity>
        <View className="mt-3 flex-row items-center justify-between bg-blue-50 rounded-lg p-3">
          <View className="flex-row items-center gap-2">
            <Feather name="navigation" size={12} color="#3b82f6" />
            <Text className="font-quicksand-medium text-xs text-blue-700">15 min from downtown</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="local-parking" size={12} color="#3b82f6" />
            <Text className="font-quicksand-medium text-xs text-blue-700">Parking available</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default JobInfo;
