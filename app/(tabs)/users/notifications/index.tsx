import BackBar from "@/components/BackBar";
import { useUserNotifications } from "@/lib/services/useUserNotifications";
import useNotificationStore from "@/store/notifications.store";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Notifications = () => {
  const { notifications } = useNotificationStore();
  const { isLoading, data } = useUserNotifications();

  console.log("Notifications from useUserNotifications hook: ", data);
  console.log("Notifications from store: ", notifications);
  return (
    <SafeAreaView>
      <BackBar label="Notifications" />
      <Text>Notifications</Text>
    </SafeAreaView>
  );
};

export default Notifications;
