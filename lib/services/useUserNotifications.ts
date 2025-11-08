import { Notification } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const USER_NOTIFICATIONS_URL = 'http://192.168.2.29:8080/user-notifications'

export const useUserNotifications = (isAuthenticated: boolean) => {
    const fetchNotifications = async () => {
        const token = await AsyncStorage.getItem('x-auth-token');
        const response = await fetch(`${USER_NOTIFICATIONS_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': `Bearer ${token}`
            },
        });
        const data = await response.json();
        console.log(data)
        return data as Notification[];
    }

    return useQuery<Notification[], Error>({
        queryKey: ['user-notifications'],
        queryFn: fetchNotifications,
        enabled: isAuthenticated,
    })
}