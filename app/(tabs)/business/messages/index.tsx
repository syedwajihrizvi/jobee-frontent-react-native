import BackBar from "@/components/BackBar";
import MessagePreviewCard from "@/components/MessagePreviewCard";
import SearchBar from "@/components/SearchBar";
import { useConversations } from "@/lib/services/useConversations";
import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Messages = () => {
  const { isAuthenticated } = useAuthStore();
  const { conversations, setConversations } = useConversationStore();
  const { data: messages, isLoading } = useConversations();
  useEffect(() => {
    if (messages && !isLoading && isAuthenticated) {
      setConversations(messages || []);
    }
  }, [messages, isLoading, conversations, setConversations, isAuthenticated]);
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView className="relative flex-1 bg-white pb-20">
      <BackBar label="Messages" />
      <View className="w-full items-center justify-center mt-4 mb-4">
        <SearchBar placeholder="Search Messages by name..." onSubmit={() => {}} />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : (
        <FlatList
          data={messages || []}
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
