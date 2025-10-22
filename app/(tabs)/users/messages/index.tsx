import BackBar from "@/components/BackBar";
import MessagePreviewCard from "@/components/MessagePreviewCard";
import SearchBar from "@/components/SearchBar";
import useAuthStore from "@/store/auth.store";
import { MessagePreview } from "@/type";
import { Redirect } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sampleMessageData: MessagePreview[] = [
  {
    id: 1,
    from: "John Doe",
    dateReceived: "2024-06-15",
    content: "Hello! I wanted to discuss the project details with you.",
    read: false,
  },
  {
    id: 2,
    from: "Jane Smith",
    dateReceived: "2024-06-14",
    content: "Can we schedule a meeting for next week?",
    read: false,
  },
  {
    id: 3,
    from: "Bob Johnson",
    dateReceived: "2024-06-13",
    content: "Thank you for your prompt response.",
    read: true,
  },
  {
    id: 4,
    from: "Alice Williams",
    dateReceived: "2024-06-12",
    content: "Looking forward to our collaboration!",
    read: false,
  },
  {
    id: 5,
    from: "Michael Brown",
    dateReceived: "2024-06-11",
    content: "Please find the attached documents for your review.",
    read: false,
  },
  {
    id: 6,
    from: "Emily Davis",
    dateReceived: "2024-06-10",
    content: "Let me know if you have any questions about the proposal.",
    read: false,
  },
  {
    id: 7,
    from: "David Wilson",
    dateReceived: "2024-06-09",
    content: "I appreciate your feedback on the recent updates.",
    read: false,
  },
  {
    id: 8,
    from: "Sophia Martinez",
    dateReceived: "2024-06-08",
    content: "Let's catch up over coffee sometime this week.",
    read: false,
  },
  {
    id: 9,
    from: "James Anderson",
    dateReceived: "2024-06-07",
    content: "The event was a great success, thanks for your support!",
    read: false,
  },
  {
    id: 10,
    from: "Olivia Taylor",
    dateReceived: "2024-06-06",
    content: "I'll be out of office next week, please contact my assistant.",
    read: false,
  },
  {
    id: 11,
    from: "Liam Thomas",
    dateReceived: "2024-06-05",
    content: "Looking forward to your presentation tomorrow.",
    read: false,
  },
];

const Messages = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaView className="relative flex-1 bg-white pb-20">
      <BackBar label="Messages" />
      <View className="w-full items-center justify-center mt-4 mb-4">
        <SearchBar placeholder="Search Messages by name..." onSubmit={() => {}} />
      </View>
      <FlatList
        data={sampleMessageData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => <MessagePreviewCard message={item} />}
      />
    </SafeAreaView>
  );
};

export default Messages;
