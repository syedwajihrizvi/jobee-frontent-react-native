import BackBar from "@/components/BackBar";
import { businessProfileSections } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfile = () => {
  const handleSectionPress = (route: string) => {
    router.push(`/businessProfile/editProfile/${route}` as any);
  };

  return (
    <SafeAreaView className="bg-gray-50 h-full">
      <BackBar label="Edit Profile" />
      <ScrollView className="mt-4">
        <View className="flex-1 px-6">
          <View className="flex flex-col gap-3">
            {businessProfileSections.map((section, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                onPress={() => handleSectionPress(section.route)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 gap-4">
                    <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
                      <Feather name={section.icon as any} size={18} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-base text-gray-800 mb-1">{section.label}</Text>
                      <Text className="font-quicksand-medium text-sm text-gray-500 leading-4" numberOfLines={2}>
                        {section.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View className="ml-3">
                    <Feather name="chevron-right" size={20} color="#9ca3af" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
