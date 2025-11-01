import BackBar from "@/components/BackBar";
import MessagePreviewCard from "@/components/MessagePreviewCard";
import SearchBar from "@/components/SearchBar";
import { createStompClient } from "@/lib/chat";
import { useConversations } from "@/lib/services/useConversations";
import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import { Message } from "@/type";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Messages = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [search, setSearch] = useState("");
  const { conversations, setConversations } = useConversationStore();
  const { data: messages, isLoading } = useConversations(search);
  useEffect(() => {
    const userParamType = "BUSINESS";
    const client = createStompClient({
      userId: user!.id,
      userType: userParamType,
      onMessage: (msg: Message) => {
        let currentConversationIndex = conversations.findIndex((c) => c.id === msg.conversationId);
        if (currentConversationIndex > -1) {
          // CREATE A NEW OBJECT - don't mutate the original
          let currentConversation = {
            ...conversations[currentConversationIndex],
            lastMessageContent: msg.text,
            lastMessageTimestamp: msg.timestamp,
            lastMessageRead: false,
            wasLastMessageSender: msg.sentByUser,
          };

          const newConversations = [...conversations];
          newConversations[currentConversationIndex] = currentConversation;
          setConversations(newConversations);
        } else {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [user, isAuthenticated, conversations]); // Add conversations to deps

  useEffect(() => {
    if (messages && !isLoading && isAuthenticated && conversations.length === 0) {
      setConversations(messages || []);
    }
  }, [messages, isLoading, conversations, setConversations, isAuthenticated, search]);

  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView className="relative flex-1 bg-white pb-20">
      <StatusBar hidden={true} />
      <BackBar label="Messages" />
      <View className="w-full items-center justify-center mt-4 mb-4">
        <SearchBar placeholder="Search Messages by name..." onSubmit={(text) => setSearch(text)} />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          data={conversations.length > 0 ? conversations : messages || []}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => <MessagePreviewCard message={item} />}
          ListEmptyComponent={() => (
            <View>
              <Text className="text-center text-gray-500 mt-10">No conversations found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Messages;
