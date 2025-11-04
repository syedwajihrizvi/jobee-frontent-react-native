import { Notification } from "@/type";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
const SOCKET_URL = 'http://192.168.2.29:8080/ws-notifications'

type Props = {
    userId: number;
    userType: 'USER' | 'BUSINESS',
    onNotification: (notif: any) => void;
}

export const createNotificationStompClient = ({ userId, userType, onNotification }: Props) => {
    const socker = new SockJS(SOCKET_URL);
    const stompClient = new Client({
        webSocketFactory: () => socker as WebSocket,
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('Notification Stomp Client Connected');
        },
        onStompError: (frame) => {
            console.error('Notification Stomp Error: ', frame);
        }
    });
    stompClient.onConnect = () => {
        const subscriptionEndpoint = `/topic/notifications/${userType.toLocaleLowerCase()}/${userId}`;
        stompClient.subscribe(subscriptionEndpoint, (message) => {
            const body = JSON.parse(message.body);
            onNotification(body);
        })
    }
    stompClient.activate()
    return stompClient;
}

export const publishNotification = (stompClient: Client, recepientId: number, recepientType: string, notification: Notification) => {
    if (!stompClient || !stompClient.connected) {
        console.log('Stomp Client not connected');
        return false
    }
    const body = JSON.stringify({
            recepientId,
            recepientType,
            ...notification
        })
    stompClient.publish({
        destination: '/app/sendNotification',
        body
    })
    console.log('Publishing notification: ', notification);
}

