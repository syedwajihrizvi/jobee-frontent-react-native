import { images } from "@/constants";
import { createStompClient, publishMessage } from "@/lib/chat";
import useAuthStore from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { Client } from "@stomp/stompjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
};

const sampleMessages: Message[] = [
  {
    id: "1",
    text: "Hi there! I saw your job posting and I'm very interested.",
    sender: "other",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    text: "Great! I'd love to discuss the position with you. Do you have experience with React Native?",
    sender: "me",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    text: "Yes, I have 3+ years of experience with React Native and have built several mobile apps.",
    sender: "other",
    timestamp: "10:35 AM",
  },
  {
    id: "4",
    text: "That sounds perfect! Would you be available for a quick call this week?",
    sender: "me",
    timestamp: "10:37 AM",
  },
  {
    id: "5",
    text: "Absolutely! I'm free Tuesday through Thursday afternoons. What works best for you?",
    sender: "other",
    timestamp: "10:40 AM",
  },
  {
    id: "6",
    text: "How about Wednesday at 2 PM? I can send you a calendar invite.",
    sender: "me",
    timestamp: "10:42 AM",
  },
  { id: "7", text: "Perfect! Looking forward to speaking with you then.", sender: "other", timestamp: "10:43 AM" },
];

const MessageChat = () => {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const { user, userType } = useAuthStore();
  const [message, setMessage] = useState("");
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const userParamType = userType === "user" ? "USER" : "BUSINESS";
    const client = createStompClient({
      userId: user!.id,
      userType: userParamType,
      onMessage: (msg) => {
        console.log("New message received:", msg);
      },
    });
    client.activate();
    setClient(client);
    return () => {
      client.deactivate();
      setClient(null);
    };
  }, [user, userType]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === "me";
    return (
      <View className={`flex-row mb-4 px-4 ${isMe ? "justify-end" : "justify-start"}`}>
        <View className={`max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
          <View
            className={`px-4 py-3 rounded-2xl ${
              isMe ? "bg-blue-500 rounded-br-sm" : "bg-gray-100 rounded-bl-sm border border-gray-200"
            }`}
            style={{
              shadowColor: isMe ? "#3b82f6" : "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isMe ? 0.2 : 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text className={`font-quicksand-medium text-sm leading-5 ${isMe ? "text-white" : "text-gray-900"}`}>
              {item.text}
            </Text>
          </View>
          <Text className="font-quicksand-medium text-xs text-gray-500 mt-1 px-1">{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  const handleSend = () => {
    if (client == null) {
      return;
    }
    if (message.trim()) {
      // Add message logic here
      console.log("Sending message:", message);
      const senderParamType = userType === "user" ? "USER" : "BUSINESS";
      const receiverParamType = senderParamType === "USER" ? "BUSINESS" : "USER";
      publishMessage(client, user!.id, senderParamType, Number(id), receiverParamType, message);
      setMessage("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity className="mr-3 p-2 -ml-2" onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
            <View className="relative mr-3">
              <Image
                source={{ uri: images.companyLogo }}
                className="w-12 h-12 rounded-full border-2 border-gray-200"
                resizeMode="cover"
              />
              <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </View>

            <View className="flex-1">
              <Text className="font-quicksand-bold text-lg text-gray-900">{name || "John Doe"}</Text>
              <Text className="font-quicksand-medium text-sm text-emerald-600">Active now</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Feather name="phone" size={18} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Feather name="more-vertical" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={sampleMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />
        <View className="bg-white border-t border-gray-100 px-4 py-3">
          <View className="flex-row items-end gap-3">
            <TouchableOpacity
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Feather name="plus" size={20} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-1 relative">
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                multiline
                className="bg-gray-100 rounded-2xl px-4 py-3 pr-12 font-quicksand-medium text-base text-gray-900 min-h-[44px] max-h-[100px]"
                style={{
                  textAlignVertical: "center",
                }}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity className="absolute right-3 bottom-3" activeOpacity={0.7}>
                <Text className="text-lg">😊</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ${
                message.trim() ? "bg-blue-500" : "bg-gray-200"
              }`}
              style={{
                shadowColor: message.trim() ? "#3b82f6" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: message.trim() ? 0.25 : 0,
                shadowRadius: 4,
                elevation: message.trim() ? 4 : 0,
              }}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!message.trim()}
            >
              <Feather name="send" size={18} color={message.trim() ? "white" : "#9ca3af"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessageChat;
