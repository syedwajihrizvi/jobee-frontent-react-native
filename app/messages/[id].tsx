import BackBar from "@/components/BackBar";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MessageChat = () => {
  const { id, name } = useLocalSearchParams();

  return (
    <SafeAreaView className="relative flex-1 bg-white pb-20">
      <BackBar label={name as string} />
      <Text>MessageChat with {id}</Text>
    </SafeAreaView>
  );
};

export default MessageChat;
