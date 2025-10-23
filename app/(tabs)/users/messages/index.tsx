import BackBar from "@/components/BackBar";
import MessagePreviewCard from "@/components/MessagePreviewCard";
import SearchBar from "@/components/SearchBar";
import { useConversations } from "@/lib/services/useMessages";
import useAuthStore from "@/store/auth.store";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Messages = () => {
  const { isAuthenticated } = useAuthStore();
  const { data: messages, isLoading } = useConversations();
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
        />
      )}
    </SafeAreaView>
  );
};

export default Messages;
