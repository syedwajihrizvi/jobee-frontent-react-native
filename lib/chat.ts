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
        stompClient.subscribe(`/topic/messages/${userType}/${userId}`, (message) => {
            const body = JSON.parse(message.body);
            onMessage(body);
        })
    }

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
            content
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
    const response = await fetch(`${MESSAGE_API_URL}?${queryParams}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": `Bearer ${token}`
        }
    })
    const data = await response.json();
    return data as Message[];
}