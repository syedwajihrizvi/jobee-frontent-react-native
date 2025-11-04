import { createNotificationStompClient } from "@/lib/notifications";
import useAuthStore from "@/store/auth.store";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
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
  const [notificationClient, setNotificationClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const queryClient = useQueryClient();
  const stompClientRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userParamType = userType === "business" ? "BUSINESS" : "USER";
    const client = createNotificationStompClient({
      userId: user!.id,
      userType: userParamType,
      onNotification: (notif: any) => {
        console.log("Received new notification via STOMP: ", notif);
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
  }, [isAuthenticated, user, userType, queryClient]);

  return (
    <NotificationStompContext.Provider value={{ client: notificationClient, isConnected }}>
      {children}
    </NotificationStompContext.Provider>
  );
};
