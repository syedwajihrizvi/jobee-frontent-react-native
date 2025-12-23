import { Notification } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
const SOCKET_URL = 'http://192.168.2.29:8080/ws-notifications'

const NOTIFICATIONS_API_URL = 'http://192.168.2.29:8080/user-notifications'
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
        const subscriptionEndpoint = endpoint;
        stompClient.subscribe(subscriptionEndpoint, (message) => {
            const body = JSON.parse(message.body);
            onNotification(body);
        })
        },
        onStompError: (frame) => {
            console.error('Notification Stomp Error: ', frame);
        }
    });
    const endpoint = `/topic/notifications/${userType.toLocaleLowerCase()}/${userId}`;
    stompClient.activate()
    return stompClient;
}

export const publishNotification = (stompClient: Client, recipientId: number, recipientType: string, notification: Notification) => {
    if (!stompClient || !stompClient.connected) {
        console.log('Stomp Client not connected');
        return false
    }
    const body = JSON.stringify({
            recipientId,
            recipientType: recipientType.toUpperCase(),
            ...notification
        })
    stompClient.publish({
        destination: '/app/sendNotification',
        body
    })
    console.log('Publishing notification: ', notification);
}


export const publishNotificationWrapper = (
    stompClient: Client | null, recepientId: number, recepientType: string, notification: Notification) => {
    if (!stompClient) {
        console.log('Stomp Client is null');
        return;
    }
    publishNotification(stompClient, recepientId, recepientType, notification);
}

export const updateAllNotificationsStatus = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const result = await fetch(`${NOTIFICATIONS_API_URL}/mark-all-read`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 200) return null
    const data = await result.json()
    return data as Notification[]

}

export const updateNotificationStatusToRead = async (notificationId: number) => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false;
    const result = await fetch(`${NOTIFICATIONS_API_URL}/${notificationId}/mark-read`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 200) return false
    return true
}

export const deleteAllReadNotificationsFromDB = async () => {
    const token = await AsyncStorage.getItem('x-auth-token');
    if (token == null) return false
    const result = await fetch(`${NOTIFICATIONS_API_URL}/delete-read`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `Bearer ${token}`
        }
    })
    if (result.status !== 204) return false
    return true
}