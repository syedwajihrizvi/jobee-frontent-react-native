import { Conversation, Message } from "@/type";
import { create } from "zustand";

type ConversationState = {
    loading: boolean;
    unreadMessages: number;
    conversations: Conversation[];
    lastMessage: Message | null;
    setLoading: (loading: boolean) => void;
    setConversations: (conversations: Conversation[]) => void;
    setLastMessage: (message: Message | null) => void;
    setUnreadMessages: (count: number) => void;
    reduceUnreadCount: () => void;
    increaseUnreadCount: () => void;
    reset: () => void;
}

const useConversationStore = create<ConversationState>((set) => ({
    conversations: [],
    loading: false,
    unreadMessages: 0,
    lastMessage: null,
    setLastMessage: (message: Message | null) => {set({ lastMessage: message })},
    setLoading: (loading: boolean) => set({ loading }),
    setConversations: (conversations: Conversation[]) => {
        set({ conversations });
    },
    setUnreadMessages: (count: number) => set({ unreadMessages: count }),
    reduceUnreadCount: () => set((state) => ({ unreadMessages: Math.max(0, state.unreadMessages - 1) })),
    increaseUnreadCount: () => set((state) => ({ unreadMessages: state.unreadMessages + 1 })),
    reset: () => set({
        conversations: [],
        loading: false,
        unreadMessages: 0,
        lastMessage: null,
    })
}))

export default useConversationStore;