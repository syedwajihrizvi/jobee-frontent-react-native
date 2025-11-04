import { Notification } from "@/type";
import { create } from "zustand";

type NotificationState = {
    loading: boolean;
    notifications: Notification[];
    unReadCount: number;
    setLoading: (loading: boolean) => void;
    setNotifications: (notifications: Notification[]) => void;
    markNotificationAsRead: (notificationId: number) => void;
}

const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    loading: false,
    unReadCount: 0,
    setLoading: (loading: boolean) => set({ loading }),
    setNotifications: (notifications: Notification[]) => {
        const unReadCount = notifications.filter(notif => !notif.read).length
        set({ notifications, unReadCount });
    },
    markNotificationAsRead: (notificationId: number) => set((state) => {
        const updatedNotifications = state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
        );
        const unReadCount = updatedNotifications.filter(notif => !notif.read).length
        return { notifications: updatedNotifications, unReadCount };
    }),
    
}))

export default useNotificationStore;