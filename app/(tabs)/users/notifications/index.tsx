import BackBar from "@/components/BackBar";
import RenderCompanyLogo from "@/components/RenderCompanyLogo";
import {
  deleteAllReadNotificationsFromDB,
  updateAllNotificationsStatus,
  updateNotificationStatusToRead,
} from "@/lib/notifications";
import useNotificationStore from "@/store/notifications.store";
import { Notification } from "@/type";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Notifications = () => {
  const {
    notifications,
    loading,
    unReadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteAllReadNotifications,
  } = useNotificationStore();

  const [filterStatus, setFilterStatus] = useState<"READ" | "UNREAD" | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "INTERVIEW_SCHEDULED":
        return { name: "calendar", color: "#3b82f6", bgColor: "#dbeafe" };
      case "INTERVIEW_RESULT":
        return { name: "file-text", color: "#8b5cf6", bgColor: "#ede9fe" };
      case "INTERVIEW_COMPLETED":
        return { name: "check-circle", color: "#10b981", bgColor: "#d1fae5" };
      case "REJECTION":
        return { name: "x-circle", color: "#ef4444", bgColor: "#fee2e2" };
      case "GENERAL":
        return { name: "bell", color: "#6b7280", bgColor: "#f3f4f6" };
      case "APPLICATION_RECEIVED":
        return { name: "inbox", color: "#10b981", bgColor: "#d1fae5" };
      case "APPLICATION_VIEWED":
        return { name: "eye", color: "#f59e0b", bgColor: "#fef3c7" };
      case "INTERVIEW_PREP_READY":
        return { name: "book-open", color: "#14b8a6", bgColor: "#ccfbf1" };
      case "INTERVIEW_REMINDER":
        return { name: "clock", color: "#f59e0b", bgColor: "#fef3c7" };
      case "AI_RESUME_REVIEW_COMPLETE":
        return { name: "cpu", color: "#8b5cf6", bgColor: "#ede9fe" };
      default:
        return { name: "info", color: "#6b7280", bgColor: "#f3f4f6" };
    }
  };

  const filterNotifications = () => {
    if (filterStatus === "READ") {
      return notifications.filter((notif) => notif.read);
    } else if (filterStatus === "UNREAD") {
      return notifications.filter((notif) => !notif.read);
    }
    return notifications;
  };

  const getBorderColor = (type: string, isRead: boolean) => {
    switch (type) {
      case "INTERVIEW_SCHEDULED":
        return "#bfdbfe";
      case "INTERVIEW_RESULT":
        return "#c4b5fd";
      case "INTERVIEW_COMPLETED":
        return "#a7f3d0";
      case "REJECTION":
        return "#fecaca";
      case "GENERAL":
        return "#d1d5db";
      case "APPLICATION_RECEIVED":
        return "#bbf7d0";
      case "APPLICATION_VIEWED":
        return "#fed7aa";
      case "INTERVIEW_PREP_READY":
        return "#99f6e4";
      case "INTERVIEW_REMINDER":
        return "#fbbf24";
      case "AI_RESUME_REVIEW_COMPLETE":
        return "#c4b5fd";
      default:
        return "#d1d5db";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationPress = async (notification: Notification) => {
    markNotificationAsRead(notification.id!);
    updateNotificationStatusToRead(notification.id!);
    const { notificationType, context } = notification;
    if (
      notificationType === "INTERVIEW_SCHEDULED" ||
      notificationType === "INTERVIEW_COMPLETED" ||
      notificationType === "REJECTION"
    ) {
      const { interviewId } = context;
      if (interviewId) {
        router.push(`/userProfile/interviews/${interviewId}`);
      }
    } else if (notificationType === "AI_RESUME_REVIEW_COMPLETE") {
      router.push("/userProfile/editProfile");
    }
  };

  const handleClearAllReadNotifications = async () => {
    // Optimistically remove all read notifications from the store
    const prevNotifications = notifications;
    deleteAllReadNotifications();
    try {
      const res = await deleteAllReadNotificationsFromDB();
      if (!res) {
        // Revert to previous state if API call fails
        useNotificationStore.setState({ notifications: prevNotifications });
      }
    } catch (error) {}
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconData = getNotificationIcon(item.notificationType);
    const borderColor = getBorderColor(item.notificationType, item.read || false);
    const context = item.context || {};
    const { companyLogoUrl, companyId } = context;
    return (
      <TouchableOpacity
        className="bg-white"
        style={{
          borderRadius: 12,
          marginHorizontal: 16,
          marginVertical: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: item.read ? 0.05 : 0.1,
          shadowRadius: 4,
          borderColor: borderColor,
          borderWidth: 1,
          elevation: item.read ? 2 : 3,
        }}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View className="p-4">
          <View className="flex-row items-start gap-3">
            {companyId ? (
              <RenderCompanyLogo logoUrl={companyLogoUrl} size={12} />
            ) : (
              <View
                className="w-12 h-12 items-center justify-center"
                style={{ backgroundColor: iconData.bgColor, borderRadius: 24 }}
              >
                <Feather name={iconData.name as any} size={20} color={iconData.color} />
              </View>
            )}

            <View className="flex-1">
              <Text
                className={`font-quicksand-semibold text-sm leading-5 ${item.read ? "text-gray-700" : "text-gray-900"}`}
              >
                {item.message}
              </Text>

              <View className="flex-row items-center justify-between mt-2">
                <Text className="font-quicksand-medium text-xs text-gray-500">{formatTimestamp(item.timestamp)}</Text>
                {!item.read && <View className="w-2 h-2 bg-blue-500 rounded-full" />}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View
        className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Feather name="bell-off" size={32} color="#9ca3af" />
      </View>
      <Text className="font-quicksand-bold text-xl text-gray-900 mb-3 text-center">
        {filterStatus === "UNREAD" ? "No Unread Notifications" : "No Notifications"}
      </Text>
      <Text className="font-quicksand-medium text-sm text-gray-600 text-center leading-6">
        You are all caught up! New notifications will appear here when you receive them.
      </Text>
    </View>
  );

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistically update all notifications as read in the store
      markAllNotificationsAsRead();
      await updateAllNotificationsStatus();
    } catch (error) {
      console.log("Error marking all notifications as read: ", error);
    } finally {
      console.log("Finished marking all notifications as read");
    }
  };

  const renderNotificationFilters = () => {
    return (
      <View className="flex-row gap-3 mx-4 my-4">
        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-xl border-2 ${
            filterStatus === null ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"
          }`}
          style={{
            shadowColor: filterStatus === null ? "#3b82f6" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: filterStatus === null ? 0.2 : 0.05,
            shadowRadius: 4,
            elevation: filterStatus === null ? 3 : 1,
          }}
          onPress={() => setFilterStatus(null)}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-bold text-center text-sm ${
              filterStatus === null ? "text-white" : "text-gray-700"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-xl border-2 ${
            filterStatus === "UNREAD" ? "bg-orange-500 border-orange-500" : "bg-white border-gray-200"
          }`}
          style={{
            shadowColor: filterStatus === "UNREAD" ? "#f97316" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: filterStatus === "UNREAD" ? 0.2 : 0.05,
            shadowRadius: 4,
            elevation: filterStatus === "UNREAD" ? 3 : 1,
          }}
          onPress={() => setFilterStatus("UNREAD")}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center gap-1">
            <Text
              className={`font-quicksand-bold text-sm ${filterStatus === "UNREAD" ? "text-white" : "text-gray-700"}`}
            >
              Unread
            </Text>
            {unReadCount > 0 && (
              <View
                className={`rounded-full px-2 py-0.5 min-w-5 h-5 items-center justify-center ${
                  filterStatus === "UNREAD" ? "bg-white bg-opacity-20" : "bg-orange-100"
                }`}
              >
                <Text className="font-quicksand-bold text-xs text-orange-600">{unReadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 px-4 rounded-xl border-2 ${
            filterStatus === "READ" ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-200"
          }`}
          style={{
            shadowColor: filterStatus === "READ" ? "#22c55e" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: filterStatus === "READ" ? 0.2 : 0.05,
            shadowRadius: 4,
            elevation: filterStatus === "READ" ? 3 : 1,
          }}
          onPress={() => setFilterStatus("READ")}
          activeOpacity={0.8}
        >
          <Text
            className={`font-quicksand-bold text-center text-sm ${
              filterStatus === "READ" ? "text-white" : "text-gray-700"
            }`}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    if (unReadCount === 0) {
      return (
        <View className="flex-col gap-4 px-4">
          <View className="py-3 bg-emerald-50 border-b border-emerald-100 items-center">
            <Text className="font-quicksand-bold text-sm text-gray-700">No new notifications</Text>
          </View>
          {renderNotificationFilters()}
          {renderDeleteAllReadNotifications()}
        </View>
      );
    }

    return (
      <View>
        <View className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <View className="flex-row items-center justify-between">
            <Text className="font-quicksand-semibold text-sm text-blue-800">
              {unReadCount} unread notification{unReadCount !== 1 ? "s" : ""}
            </Text>

            <TouchableOpacity
              className="bg-blue-500 px-3 py-1 rounded-lg"
              activeOpacity={0.7}
              onPress={handleMarkAllAsRead}
            >
              <Text className="font-quicksand-bold text-white text-xs">Mark all as read</Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderNotificationFilters()}
        {renderDeleteAllReadNotifications()}
      </View>
    );
  };

  const renderDeleteAllReadNotifications = () => {
    if (notifications.length > 0) {
      return (
        <View className="pb-4 mx-4">
          <TouchableOpacity
            className="bg-red-50 border border-red-200 rounded-xl py-3 px-4 flex-row items-center justify-center gap-2"
            style={{
              shadowColor: "#ef4444",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleClearAllReadNotifications}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={16} color="#dc2626" />
            <Text className="font-quicksand-bold text-red-600 text-sm">Clear All Read Notifications</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Notifications" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="font-quicksand-medium text-gray-600 mt-4">Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={filterNotifications()}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={renderNotificationItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Notifications;
