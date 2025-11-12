import { sounds } from "@/constants";
import { createNotificationStompClient } from "@/lib/notifications";
import { useUserNotifications } from "@/lib/services/useUserNotifications";
import useAuthStore from "@/store/auth.store";
import useNotificationStore from "@/store/notifications.store";
import useUserStore from "@/store/user.store";
import { Notification } from "@/type";
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
  const { setNotifications, setLoading } = useNotificationStore();
  const [notificationClient, setNotificationClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: userNotifications, isLoading } = useUserNotifications(isAuthenticated);
  const {
    setApplicationStatus,
    setInterviewStatus: setInterviewToStatus,
    setInterviewDecision,
    refetchInterviews,
  } = useUserStore();
  const player = useAudioPlayer(sounds.newNotification);

  const queryClient = useQueryClient();
  const stompClientRef = useRef<any>(null);

  const handleNewNotification = ({ notificationType, context }: Notification) => {
    console.log("SYED-DEBUG: Processing new notification of type ", notificationType);
    console.log("SYED-DEBUG: Notification context: ", context);
    if (notificationType === "REJECTION") {
      const { applicationId, interviewId } = context;
      if (applicationId) {
        setApplicationStatus(applicationId, "REJECTED");
      }
      if (interviewId) {
        setInterviewDecision(interviewId, "REJECTED");
        queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
      }
    } else if (notificationType === "INTERVIEW_COMPLETED") {
      console.log("SYED-DEBUG: Handling INTERVIEW_COMPLETED notification");
      const { applicationId, interviewId } = context;
      console.log("SYED-DEBUG: applicationId:", applicationId, "interviewId:", interviewId);
      if (applicationId) {
        console.log("SYED-DEBUG: Setting application status to INTERVIEW_COMPLETED for applicationId:", applicationId);
        setApplicationStatus(applicationId, "INTERVIEW_COMPLETED");
      }
      if (interviewId) {
        console.log("SYED-DEBUG: Setting interview status to COMPLETED for interviewId:", interviewId);
        setInterviewToStatus(interviewId, "COMPLETED");
        queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
      }
    } else if (notificationType === "INTERVIEW_SCHEDULED") {
      console.log("SYED-DEBUG: Handling INTERVIEW_SCHEDULED notification");
      const { applicationId, interviewId } = context;
      console.log("SYED-DEBUG: applicationId:", applicationId, "interviewId:", interviewId);
      if (applicationId) {
        console.log("SYED-DEBUG: Setting application status to INTERVIEW_SCHEDULED for applicationId:", applicationId);
        setApplicationStatus(applicationId, "INTERVIEW_SCHEDULED");
      }
      refetchInterviews();
    }
  };

  useEffect(() => {
    if (!isLoading && userNotifications) {
      setLoading(false);
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
      onNotification: (notif: Notification) => {
        console.log("Received notification via STOMP: ", notif);
        player.seekTo(0);
        player.play();
        const currentNotifications = useNotificationStore.getState().notifications;
        handleNewNotification(notif);
        setNotifications([notif, ...currentNotifications]);
        // Update store related to queries: Interview Schedules, Applicatons, etc
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
