import { sounds } from "@/constants";
import { createStompClient } from "@/lib/chat";
import useAuthStore from "@/store/auth.store";
import useConversationStore from "@/store/conversation.store";
import { Message } from "@/type";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface StompContextType {
  client: any;
  isConnected: boolean;
}

const StompContext = createContext<StompContextType>({
  client: null,
  isConnected: false,
});

export const useStomp = () => useContext(StompContext);

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, userType } = useAuthStore();
  const { conversations, setConversations, increaseUnreadCount, lastMessage, setLastMessage } = useConversationStore();
  const [client, setClient] = useState<Client | null>(null);
  const player = useAudioPlayer(sounds.popSound);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const stompClientRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userParamType = userType === "business" ? "BUSINESS" : "USER";
    const client = createStompClient({
      userId: user!.id,
      userType: userParamType,
      onMessage: (msg: Message) => {
        player.seekTo(0);
        player.play();
        console.log("RECEIVED NEW MESSAGE VIA STOMP");
        setLastMessage(msg);
        let currentConversationIndex = conversations.findIndex((c) => c.id === msg.conversationId);
        if (currentConversationIndex > -1) {
          let currentConversation = {
            ...conversations[currentConversationIndex],
            lastMessageContent: msg.text,
            lastMessageTimestamp: msg.timestamp,
            lastMessageRead: false, // Always false for new incoming messages
            wasLastMessageSender: msg.sentByUser,
          };

          const newConversations = [...conversations];
          newConversations[currentConversationIndex] = currentConversation;
          setConversations(newConversations);

          if (!msg.sentByUser && conversations[currentConversationIndex].lastMessageRead) {
            console.log("Incrementing unread count for new message");
            increaseUnreadCount();
          }
        } else {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      },
    });
    setClient(client);
    setIsConnected(true);
    client.activate();
    stompClientRef.current = client;
    return () => {
      client.deactivate();
    };
  }, [user, isAuthenticated, userType]); // Add conversations to deps

  return (
    <StompContext.Provider value={{ client: stompClientRef.current, isConnected }}>{children}</StompContext.Provider>
  );
};
