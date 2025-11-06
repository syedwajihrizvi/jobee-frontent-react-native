import { sounds } from "@/constants";
import { createNotificationStompClient } from "@/lib/notifications";
import { useUserNotifications } from "@/lib/services/useUserNotifications";
import useAuthStore from "@/store/auth.store";
import useNotificationStore from "@/store/notifications.store";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface NotificationStompContextType {
  client: any;
  isConnected: boolean;
}

const NotificationStompContext = createContext<NotificationStompContextType>({
  client: null,
  isConnected: false,
});

export const useNotificationStomp = () => useContext(NotificationStompContext);

export const NotificationStompProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, userType } = useAuthStore();
  const { setNotifications, setLoading } = useNotificationStore(); // Remove notifications from here
  const [notificationClient, setNotificationClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: userNotifications, isLoading } = useUserNotifications();
  const player = useAudioPlayer(sounds.newNotification);

  const queryClient = useQueryClient();
  const stompClientRef = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && userNotifications) {
      setLoading(false);
      console.log("Setting initial notifications in store: ", userNotifications);
      setNotifications(userNotifications);
    } else {
      setLoading(true);
    }
  }, [userNotifications, isLoading, setNotifications, setLoading]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userParamType = userType === "business" ? "BUSINESS" : "USER";
    const client = createNotificationStompClient({
      userId: user!.id,
      userType: userParamType,
      onNotification: (notif: any) => {
        player.seekTo(0);
        player.play();
        const currentNotifications = useNotificationStore.getState().notifications;
        setNotifications([notif, ...currentNotifications]);
      },
    });
    setNotificationClient(client);
    stompClientRef.current = client;
    setIsConnected(true);
    return () => {
      if (stompClientRef.current) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, user, userType, queryClient]); // Remove notifications from deps

  return (
    <NotificationStompContext.Provider value={{ client: notificationClient, isConnected }}>
      {children}
    </NotificationStompContext.Provider>
  );
};
