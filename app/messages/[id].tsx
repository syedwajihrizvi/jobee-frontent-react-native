import { useStomp } from "@/context/StompContext";
import { fetchMessages, markMessageAsRead, publishMessage } from "@/lib/chat";
import { getS3BusinessProfileImage, getS3ProfileImage } from "@/lib/s3Urls";
import { formatMessageTimestamp } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import { Message } from "@/type";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MessageChat = () => {
  const { id, name, role, conversationId, profileImageUrl } = useLocalSearchParams();
  const router = useRouter();
  const { client } = useStomp();
  const { user, userType } = useAuthStore();
  const { conversations, setConversations, reduceUnreadCount, lastMessage } = useConversationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchChatMessages = async () => {
      try {
        const msgs = await fetchMessages({
          conversationId: Number(conversationId),
          otherPartyId: Number(id),
          otherPartyRole: role as string,
        });
        if (msgs) {
          setMessages(msgs);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        console.log("Fetch messages aborted or completed");
      }
    };
    fetchChatMessages();
    return () => {
      controller.abort();
    };
  }, [id, name, role, conversationId]);

  // Run use effect once to make any unread messages as read
  useEffect(() => {
    const conversation = conversations.find((c) => c.id === Number(conversationId));
    if (conversation && !conversation.lastMessageRead) {
      markMessageAsRead(Number(conversationId));
      const updatedConversation = { ...conversation, lastMessageRead: true };
      const updatedConversations = conversations.filter((c) => c.id !== Number(conversationId));
      updatedConversations.unshift(updatedConversation);
      setConversations(updatedConversations);
    }
  }, []);

  useEffect(() => {
    // Check the latest incoming message for this conversation and see if it is updated
    if (lastMessage?.conversationId === Number(conversationId)) {
      setMessages((prevMessages) => [...prevMessages, lastMessage]);
      markMessageAsRead(Number(conversationId));
      if (!lastMessage.sentByUser) {
        reduceUnreadCount();
      }
    }
  }, [lastMessage, conversationId, reduceUnreadCount]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sentByUser;
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
          <Text className="font-quicksand-medium text-xs text-gray-500 mt-1 px-1">
            {formatMessageTimestamp(item.timestamp)}
          </Text>
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

  const renderProfileImageUrl = () => {
    if (profileImageUrl && profileImageUrl !== "null" && profileImageUrl !== "undefined") {
      const uri =
        role === "BUSINESS"
          ? getS3BusinessProfileImage(profileImageUrl as string)
          : getS3ProfileImage(profileImageUrl as string);
      return <Image source={{ uri }} className="w-12 h-12 rounded-full border-2 border-gray-200" resizeMode="cover" />;
    }
    return (
      <View className="w-12 h-12 rounded-full border-2 border-gray-200 items-center justify-center bg-gray-100">
        <Feather name="user" size={30} color="black" />
      </View>
    );
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
              {renderProfileImageUrl()}
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
          ref={flatListRef}
          data={[...messages].reverse()} // <-- clone to avoid mutation
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          inverted // <-- this alone handles the bottom-up behavior
          onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
          ListEmptyComponent={
            <View className="items-center justify-center px-6 mt-20">
              <Text className="font-quicksand-semibold text-lg text-gray-800 text-center">Start a conversation</Text>
              <Text className="font-quicksand-medium text-sm text-gray-500 text-center">
                Send a message to {name || "this user"} to get the conversation going.
              </Text>
            </View>
          }
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
