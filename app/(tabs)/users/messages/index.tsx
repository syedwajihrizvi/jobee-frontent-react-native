import BackBar from "@/components/BackBar";
import MessagePreviewCard from "@/components/MessagePreviewCard";
import SearchBar from "@/components/SearchBar";
import { useConversations } from "@/lib/services/useConversations";
import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Messages = () => {
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");
  const { conversations } = useConversationStore();
  const { data: messages, isLoading } = useConversations(search, isAuthenticated);

  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView className="relative flex-1 bg-white pb-20">
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
            <View className="flex-1 items-center justify-center px-6 py-20">
              <View
                className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Feather name="message-circle" size={32} color="#3b82f6" />
              </View>

              <Text className="font-quicksand-bold text-xl text-gray-900 mb-3 text-center">No Messages Yet</Text>

              <Text className="font-quicksand-medium text-gray-600 text-center leading-6 mb-4">
                Your conversations with employers and recruiters will appear here. Start applying to jobs to begin
                networking!
              </Text>

              <TouchableOpacity
                className="bg-emerald-500 px-6 py-3 rounded-xl flex-row items-center gap-2 mb-4"
                style={{
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                onPress={() => router.push("/(tabs)/users/jobs")}
                activeOpacity={0.8}
              >
                <Feather name="search" size={16} color="white" />
                <Text className="font-quicksand-bold text-white">Find Jobs</Text>
              </TouchableOpacity>

              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-start gap-3">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                  <Feather name="info" size={12} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="font-quicksand-semibold text-blue-800 text-sm mb-1">How Messaging Works</Text>
                  <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                    When you apply to jobs or companies reach out to you, conversations will start here automatically.
                  </Text>
                </View>
              </View>

              <View className="mt-6 flex-row items-center gap-3">
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
                <Text className="font-quicksand-medium text-xs text-gray-500">
                  Messages and notifications will appear here
                </Text>
                <View className="w-1 h-1 bg-gray-300 rounded-full" />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Messages;
