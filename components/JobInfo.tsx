import { getAIJobInsights } from "@/lib/jobEndpoints";
import { Job } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

const JobInfo = ({ job }: { job: Job }) => {
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const openMapWithAddress = () => {
    const encodedAddress = encodeURIComponent(job?.location || "San Francisco, CA");
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });

    Linking.openURL(url!);
  };

  useEffect(() => {
    const fetchAIJobInsights = async () => {
      setLoadingInsights(true);
      try {
        const res = await getAIJobInsights(job.id);
        console.log("Fetched AI Job Insights:", res);
        if (res) {
          setAiInsights(res);
        }
      } catch (error) {
        console.error("Error fetching AI job insights:", error);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchAIJobInsights();
  }, [job.id]);

  return (
    <ScrollView className="flex-1 px-4">
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
        {loadingInsights ? (
          <View className="h-[200px] w-full">
            <Text className="font-quicksand-medium text-sm text-gray-700 mb-2">Loading insights...</Text>
            <ActivityIndicator size="large" color="#8b5cf6" />
          </View>
        ) : (
          <View className="gap-2">
            {aiInsights.map((insight, index) => (
              <View key={index} className="flex-row items-start gap-2">
                <View className="w-4 h-4 bg-emerald-100 rounded-full items-center justify-center mt-0.5">
                  <Feather name="check" size={10} color="#10b981" />
                </View>
                <Text className="font-quicksand-medium text-sm text-gray-700 flex-1 leading-5">{insight}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View className="py-4 border-t border-gray-100">
        <View className="flex-row items-center gap-2 mb-3">
          <Feather name="map-pin" size={16} color="#3b82f6" />
          <Text className="font-quicksand-bold text-base text-gray-900">Location</Text>
        </View>
        <View>
          <Text className="font-quicksand-semibold text-sm text-gray-600 mb-3">
            {job.streetAddress} | {job.city}, {job.state} {job.postalCode} | {job.country}
          </Text>
        </View>
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
    </ScrollView>
  );
};

export default JobInfo;
