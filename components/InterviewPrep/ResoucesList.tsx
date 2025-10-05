import { InterviewPreparation } from "@/type";
import { AntDesign, Feather } from "@expo/vector-icons";
import React from "react";
import { Alert, FlatList, Linking, Text, TouchableOpacity, View } from "react-native";

const ResourcesList = ({ interviewPrep }: { interviewPrep: InterviewPreparation }) => {
  const handleResourceClick = async (resource: { link: string }) => {
    // Handle resource click, e.g., open link in browser
    console.log("Resource clicked:", resource.link);
    const supported = await Linking.canOpenURL(resource.link);
    if (!supported) {
      Alert.alert(`Cannot open URL: ${resource.link}`);
    } else {
      await Linking.openURL(resource.link);
    }
  };

  const emailAllResources = () => {
    console.log("Email all resources");
  };

  const shareResources = () => {
    console.log("Share resources");
  };

  return (
    <View key={12} className="w-full h-full items-start gap-4 p-4">
      <View className="w-full h-[550px] mt-2 overflow-hidden flex-col gap-4">
        <Text className="font-quicksand-bold text-lg text-center">
          Check out these resources below. Simply click them to view. I can also email these or provide other options to
          share them.
        </Text>
        <FlatList
          data={interviewPrep?.resources || []}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleResourceClick(item)}
              className="bg-green-500 dark:bg-[#1e1e1e] rounded-2xl shadow-md mb-4 p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4, // Android shadow
              }}
            >
              <View className="flex flex-row items-start gap-2">
                <AntDesign name="link" size={18} color="black" />
                <View className="flex flex-col px-2">
                  <Text className="font-quicksand-bold text-md">{item.title}</Text>
                  <Text className="font-quicksand-bold text-sm">{item.type[0].toUpperCase() + item.type.slice(1)}</Text>
                  <Text className="font-quicksand-regular text-xs">{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <View className="w-full flex-row items-center justify-center gap-4 mb-2 px-2">
          <TouchableOpacity className="bg-black p-2 rounded-full flex-row gap-2 px-4" onPress={emailAllResources}>
            <Feather name="mail" size={18} color="#22c55e" />
            <Text className="font-quicksand-semibold text-green-500">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-black p-2 rounded-full flex-row gap-2 px-4" onPress={shareResources}>
            <Feather name="share" size={18} color="#22c55e" />
            <Text className="font-quicksand-semibold text-green-500">Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ResourcesList;
