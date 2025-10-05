import BackBar from "@/components/BackBar";
import { useExperiences } from "@/lib/services/useExperiences";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Experiences = () => {
  const { data: experiences, isLoading } = useExperiences();
  return (
    <SafeAreaView>
      <BackBar label="Experiences" />
      <ScrollView>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">View and edit your work experiences</Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              These are automatically extracted from your resume, but you can update, add, or delete experiences to
              better reflect your professional background.
            </Text>
          </View>
        </View>

        <View className="px-6 pb-6">
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-medium text-gray-600 mt-4">Loading Experiences...</Text>
            </View>
          ) : (
            <View className="flex flex-col gap-4">
              <TouchableOpacity
                className="bg-green-500 rounded-xl px-6 py-4 flex-row items-center justify-center mb-2"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={() => console.log("Add new experience")}
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="text-white font-quicksand-bold text-base ml-2">Add New Experience</Text>
              </TouchableOpacity>
              {experiences && experiences.length > 0 ? (
                <View className="gap-4">
                  {experiences.map((exp, index) => (
                    <TouchableOpacity
                      key={index}
                      className="bg-white rounded-2xl p-5 border border-gray-100"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                      onPress={() => console.log("Edit experience", exp)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                              <Feather name="briefcase" size={14} color="#3b82f6" />
                            </View>
                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                              <Text className="font-quicksand-bold text-xs text-blue-700">EXPERIENCE</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity className="p-1">
                          <Feather name="edit-2" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      </View>

                      <Text className="font-quicksand-bold text-gray-800 text-lg mb-2" numberOfLines={2}>
                        {exp.title}
                      </Text>

                      <View className="flex-row items-center mb-2">
                        <Text className="font-quicksand-semibold text-gray-600 text-base">{exp.company}</Text>
                      </View>

                      <View className="flex-row items-center gap-2 mb-3">
                        <Feather name="calendar" size={14} color="#6b7280" />
                        <Text className="font-quicksand-medium text-gray-500 text-sm">
                          {exp.from} - {exp.to || "Present"}
                        </Text>
                      </View>

                      {exp.city && (
                        <View className="flex-row items-center gap-2 mb-3">
                          <Feather name="map-pin" size={14} color="#6b7280" />
                          <Text className="font-quicksand-medium text-gray-500 text-sm">
                            {exp.city}, {exp.country}
                          </Text>
                        </View>
                      )}

                      {exp.description && (
                        <View className="mt-2 p-3 bg-gray-50 rounded-xl">
                          <Text className="font-quicksand-medium text-gray-700 text-sm leading-5" numberOfLines={3}>
                            {exp.description}
                          </Text>
                        </View>
                      )}
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Feather name="clock" size={12} color="#22c55e" />
                            <Text className="font-quicksand-medium text-green-600 text-xs">
                              {/* Calculate duration here */}
                              Duration: 2 years 3 months
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Feather name="arrow-right" size={12} color="#9ca3af" />
                            <Text className="font-quicksand-medium text-gray-400 text-xs">Tap to edit</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Feather name="award" size={24} color="#9ca3af" />
                  </View>
                  <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Experiences Added Yet</Text>
                  <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-4">
                    Showcase your professional experiences to attract potential employers and highlight your expertise.
                  </Text>
                  <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-xl" onPress={() => {}}>
                    <Text className="font-quicksand-semibold text-white text-sm">Add Your First Experience</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Experiences;
