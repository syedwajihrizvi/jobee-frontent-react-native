import { sounds } from "@/constants";
import { createNotificationStompClient } from "@/lib/notifications";
import { useUserNotifications } from "@/lib/services/useUserNotifications";
import useAuthStore from "@/store/auth.store";
import useNotificationStore from "@/store/notifications.store";
import useUserStore from "@/store/user.store";
import useUserJobsStore from "@/store/userJobsStore";
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
  const { refetchCandidateInformation } = useUserStore();
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
  const { updateAppliedJobs } = useUserJobsStore();
  const player = useAudioPlayer(sounds.newNotification);

  const queryClient = useQueryClient();
  const stompClientRef = useRef<any>(null);

  const handleNewNotification = ({ notificationType, context }: Notification) => {
    const { applicationId, interviewId, jobId } = context;
    let newStatus = "";
    if (notificationType === "REJECTION") {
      if (applicationId) {
        setApplicationStatus(applicationId, "REJECTED", jobId!);
        newStatus = "REJECTED";
      }
      if (interviewId) {
        setInterviewDecision(interviewId, "REJECTED");
        queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
        newStatus = "REJECTED";
      }
    } else if (notificationType === "INTERVIEW_COMPLETED") {
      if (applicationId) {
        setApplicationStatus(applicationId, "INTERVIEW_COMPLETED", jobId!);
        newStatus = "INTERVIEW_COMPLETED";
      }
      if (interviewId) {
        setInterviewToStatus(interviewId, "COMPLETED");
        queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
        newStatus = "COMPLETED";
      }
    } else if (notificationType === "INTERVIEW_SCHEDULED") {
      if (applicationId) {
        setApplicationStatus(applicationId, "INTERVIEW_SCHEDULED", jobId!);
        newStatus = "INTERVIEW_SCHEDULED";
      }
      refetchInterviews();
    } else if (notificationType === "AI_RESUME_REVIEW_COMPLETE") {
      queryClient.invalidateQueries({ queryKey: ["profileCompleteness"] });
      refetchCandidateInformation();
    } else if (notificationType === "INTERVIEW_CANCELLED") {
      setInterviewToStatus(interviewId!, "CANCELLED");
      queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
      refetchInterviews();
      newStatus = "CANCELLED";
    } else if (notificationType === "INTERVIEW_UPDATED") {
      queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
      refetchInterviews();
      newStatus = "SCHEDULED";
    } else if (notificationType === "INTERVIEW_RESCHEDULE_REQUESTED") {
      queryClient.invalidateQueries({ queryKey: ["interviewDetails", interviewId] });
      refetchInterviews();
    }
    if (notificationType !== "AI_RESUME_REVIEW_COMPLETE" && jobId) {
      updateAppliedJobs(jobId, newStatus);
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
