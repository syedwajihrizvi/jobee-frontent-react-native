import { Message } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = 'http://192.168.2.29:8080/ws-chat'

const MESSAGE_API_URL = 'http://192.168.2.29:8080/messages'
type Props = {
    userId: number;
    userType: 'USER' | 'BUSINESS',
    onMessage: (msg: any) => void;
}

export const createStompClient = ({ userId, userType, onMessage }: Props) => {
    const socker = new SockJS(SOCKET_URL);
    const stompClient = new Client({
        webSocketFactory: () => socker as WebSocket,
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('Stomp Client Connected');
        },
        onStompError: (frame) => {
            console.error('Stomp Error: ', frame);
        }
    });
    stompClient.onConnect = () => {
        console.log('Stomp Client Connected');
        const subscriptionEndpoint = `/topic/messages/${userType.toLocaleLowerCase()}/${userId}`;
        console.log('Subscribing to:', subscriptionEndpoint);
        stompClient.subscribe(subscriptionEndpoint, (message) => {
            const body = JSON.parse(message.body);4
            onMessage(body);
        })
    }
    stompClient.activate()
    return stompClient;
}

export const publishMessage = (stompClient: Client, senderId: number, senderType: string, receiverId: number, receiverType: string, content: string) => {
    if (!stompClient || !stompClient.connected) {
        console.log('Stomp Client not connected');
        return false
    }
    stompClient.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify({
            senderId,
            senderType,
            receiverId,
            receiverType,
            text:content
        })
    })
    console.log('Message published');
    return true;
}

export const fetchMessages = async ({conversationId, otherPartyId, otherPartyRole}: {conversationId: number, otherPartyId: number, otherPartyRole: string}) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const params = new URLSearchParams();
    params.append('conversationId', conversationId.toString());
    params.append('otherPartyId', otherPartyId.toString());
    params.append('otherPartyRole', otherPartyRole);
    const queryParams = params.toString()
    console.log("Fetching messages with params:", queryParams);
    const response = await fetch(`${MESSAGE_API_URL}?${queryParams}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": `Bearer ${token}`
        }
    })
    console.log("Response OK:", response);
    console.log("Response status:", response.status);
    const data = await response.json();
    return data as Message[];
}

export const fetchConversationBetweenUsers = async (otherPartyId: number, otherPartyRole: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const params = new URLSearchParams();
    params.append('otherPartyId', otherPartyId.toString());
    params.append('otherPartyRole', otherPartyRole);
    const queryParams = params.toString()
    const response = await fetch(`${MESSAGE_API_URL}/conversationBetweenUsers?${queryParams}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": `Bearer ${token}`
        }
    })
    console.log("Response status:", response.status);
    if (response.status === 404) {
        return null;
    }
    console.log("Response OK:", response);
    console.log(response.text)
    const data = await response.json();
    console.log("Fetched conversation between users:", data);
    return data.conversationId as number;
}

export const createConversationBetweenUsers = async (otherPartyId: number, otherPartyRole: string) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    const response = await fetch(`${MESSAGE_API_URL}/conversations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": `Bearer ${token}`
        },
        body: JSON.stringify({
            otherPartyId,
            otherPartyRole
        })
    })
    const data = await response.json();
    console.log("Created conversation between users:", data);
    return data.id as number;
}