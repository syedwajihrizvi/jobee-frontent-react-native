import { Conversation } from "@/type";
import { create } from "zustand";

type ConversationState = {
    loading: boolean;
    conversations: Conversation[];
    setLoading: (loading: boolean) => void;
    setConversations: (conversations: Conversation[]) => void;
}

const useConversationStore = create<ConversationState>((set) => ({
    conversations: [],
    loading: false,
    setLoading: (loading: boolean) => set({ loading }),
    setConversations: (conversations: Conversation[]) => set({ conversations }),
}))

export default useConversationStore;