import { Conversation } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const MESSAGES_API_URL = 'http://192.168.2.29:8080/messages'

export const useConversations = () => {
    const fetchMessages = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${MESSAGES_API_URL}/conversations`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("Fetched messages:", data);
        return data as Conversation[];
    }

    return useQuery<Conversation[], Error>({
        queryKey: ['messages'],
        queryFn: fetchMessages,
    })
}