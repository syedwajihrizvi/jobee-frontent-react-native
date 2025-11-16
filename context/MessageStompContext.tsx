import { sounds } from "@/constants";
import { createMessageStompClient } from "@/lib/chat";
import { useConversations } from "@/lib/services/useConversations";
import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import { Message } from "@/type";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface MessageStompContextType {
  client: any;
  isConnected: boolean;
}

const MessageStompContext = createContext<MessageStompContextType>({
  client: null,
  isConnected: false,
});

export const useStomp = () => useContext(MessageStompContext);

export const MessageStompProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, userType } = useAuthStore();
  const { setConversations, setLastMessage, setUnreadMessages, increaseUnreadCount } = useConversationStore();
  const [messageClient, setMessageClient] = useState<Client | null>(null);
  const player = useAudioPlayer(sounds.popSound);
  const [isConnected, setIsConnected] = useState(false);
  const { data: conversations, isLoading } = useConversations("", isAuthenticated);
  const queryClient = useQueryClient();
  const stompClientRef = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && conversations) {
      setConversations(conversations);
      const unreadCount = conversations.filter((conv) => !conv.lastMessageRead).length;
      setUnreadMessages(unreadCount);
    }
  }, [conversations, isLoading, setConversations, setUnreadMessages]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userParamType = userType === "business" ? "BUSINESS" : "USER";
    const client = createMessageStompClient({
      userId: user!.id,
      userType: userParamType,
      onMessage: (msg: Message) => {
        player.seekTo(0);
        player.play();
        setLastMessage(msg);
        const currentConversations = useConversationStore.getState().conversations;
        let currentConversationIndex = currentConversations.findIndex((c) => c.id === msg.conversationId);
        if (currentConversationIndex > -1) {
          let currentConversation = {
            ...currentConversations[currentConversationIndex],
            lastMessageContent: msg.text,
            lastMessageTimestamp: msg.timestamp,
            lastMessageRead: false, // Always false for new incoming messages
            wasLastMessageSender: msg.sentByUser,
          };
          const newConversations = [...currentConversations];
          newConversations[currentConversationIndex] = currentConversation;
          setConversations(newConversations);
          if (msg.sentByUser === false) increaseUnreadCount();
        } else {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      },
    });
    setMessageClient(client);
    setIsConnected(true);
    client.activate();
    stompClientRef.current = client;
    return () => {
      client.deactivate();
    };
  }, [user, isAuthenticated, userType, player, setLastMessage, setConversations, queryClient]);

  return (
    <MessageStompContext.Provider value={{ client: stompClientRef.current, isConnected }}>
      {children}
    </MessageStompContext.Provider>
  );
};
