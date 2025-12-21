import { registerForPushNotifications, scheduleInterviewReminder } from "@/lib/auth";
import { setRemindersTrueForInterviewPrep } from "@/lib/interviewEndpoints";
import { convertToDate, isInPast } from "@/lib/utils";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ModalWithBg from "../ModalWithBg";

const notificationOptions = [
  { label: "15 Minutes", value: 15 },
  { label: "30 Minutes", value: 30 },
  { label: "1 Hour", value: 60 },
  { label: "6 Hours", value: 360 },
  { label: "1 Day", value: 1440 },
  { label: "3 Days", value: 4320 },
];

const getNotifBody = (minutesBefore: number) => {
  switch (minutesBefore) {
    case 15:
      return "Your interview is in 15 minutes. Get ready!";
    case 30:
      return "Your interview is in 30 minutes. Time to prepare!";
    case 60:
      return "Your interview is in 1 hour. Make sure you're set up!";
    case 360:
      return "Your interview is in 6 hours. Review your notes!";
    case 1440:
      return "Your interview is tomorrow. Get a good night's sleep!";
    case 4320:
      return "Your interview is in 3 days. Finalize your preparations!";
    default:
      return "Your interview is coming up soon. Be prepared!";
  }
};

const Calendar = ({
  startTime,
  timezone,
  interviewDate,
  companyName,
  interviewId,
  remindersSet,
}: {
  startTime: string;
  timezone: string;
  interviewDate: string;
  companyName: string;
  interviewId: number;
  remindersSet: boolean;
}) => {
  const interviewStartTime = convertToDate(interviewDate, startTime, timezone);

  const notificationDates: Record<number, Date> = {
    15: new Date(interviewStartTime.getTime() - 15 * 60 * 1000),
    30: new Date(interviewStartTime.getTime() - 30 * 60 * 1000),
    60: new Date(interviewStartTime.getTime() - 60 * 60 * 1000),
    360: new Date(interviewStartTime.getTime() - 360 * 60 * 1000),
    1440: new Date(interviewStartTime.getTime() - 1440 * 60 * 1000),
    4320: new Date(interviewStartTime.getTime() - 4320 * 60 * 1000),
  };

  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [helpRemember, setHelpRemember] = useState(remindersSet);

  const helpMeRemember = async () => {
    if (!helpRemember) {
      const res = await registerForPushNotifications();
      if (res == null) {
        Alert.alert("Error", "You need to give Jobee permission to send you notifications.", [
          {
            text: "Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]);
        return;
      }
    }
    setShowNotificationsModal(true);
  };

  const handleConfirm = async () => {
    const notifTitle = `Upcoming Interview at ${companyName}`;
    if (!helpRemember) {
      for (const minutesBefore of selectedOptions) {
        const notificationTime = notificationDates[minutesBefore];
        await scheduleInterviewReminder(notificationTime, notifTitle, getNotifBody(minutesBefore));
      }
      await setRemindersTrueForInterviewPrep(interviewId);
      setHelpRemember(true);
    } else {
      setShowNotificationsModal(false);
    }
  };

  const validNotificationOptions = notificationOptions.filter((option) => !isInPast(notificationDates[option.value]));
  return (
    <ScrollView className="w-full h-full px-3 py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center mb-3"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Feather name="calendar" size={28} color="#22c55e" />
        </View>

        <Text className="font-quicksand-bold text-xl text-center text-gray-800 leading-8 mb-4">Schedule Reminder</Text>
      </View>

      <View
        className="bg-white rounded-2xl p-6 border border-gray-100 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <View className="flex-row items-center gap-2 mb-3">
            <Feather name="bell" size={16} color="#3b82f6" />
            <Text className="font-quicksand-bold text-blue-800 text-sm">We&apos;ll help you stay prepared</Text>
          </View>
          <Text className="font-quicksand-medium text-blue-700 text-sm leading-5">
            Be ready 15 minutes before your interview. We&apos;ll add this to your calendar and send you reminders:
          </Text>

          <View className="mt-3 gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="font-quicksand-medium text-blue-700 text-xs">1 day before the interview</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="font-quicksand-medium text-blue-700 text-xs">1 hour before the interview</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <Text className="font-quicksand-medium text-blue-700 text-xs">15 minutes before the interview</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-4">
        <TouchableOpacity
          className="bg-emerald-500 py-4 rounded-xl flex-row items-center justify-center"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={helpMeRemember}
          activeOpacity={0.8}
        >
          {helpRemember ? (
            <>
              <Feather name="clock" size={20} color="white" />
              <Text className="font-quicksand-semibold text-white text-md ml-2">Reminders Set</Text>
            </>
          ) : (
            <>
              <Feather name="plus" size={20} color="white" />
              <Text className="font-quicksand-semibold text-white text-md ml-2">Help me Remember</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <View className="flex-row items-center gap-2 mb-2">
          <FontAwesome5 name="lightbulb" size={16} color="#f59e0b" />
          <Text className="font-quicksand-bold text-amber-800 text-sm">Pro Tip</Text>
        </View>
        <Text className="font-quicksand-medium text-amber-700 text-xs leading-4">
          Set up your interview space and test your technology beforehand. Having everything ready will help you feel
          more confident.
        </Text>
      </View>
      <View className="items-center mt-6">
        <View className="flex-row items-center gap-2">
          <Feather name="check-circle" size={16} color="#22c55e" />
          <Text className="font-quicksand-bold text-gray-700 text-sm">You&apos;re almost ready!</Text>
        </View>
        <Text className="font-quicksand-medium text-gray-600 text-xs text-center mt-1">
          Just one more step to ensure you don&apos;t miss your interview
        </Text>
      </View>
      <ModalWithBg visible={showNotificationsModal} customHeight={helpRemember ? 0.45 : 0.35}>
        {helpRemember ? (
          <View className="flex-1 px-6 py-5">
            <View className="flex-col items-center justify-center mb-4">
              <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-3">
                <Feather name="check" size={32} color="#22c55e" />
              </View>
              <Text className="font-quicksand-bold text-lg text-center mb-2">Reminders Set!</Text>
              <Text className="font-quicksand-semibold text-sm text-center text-gray-600">
                You will receive push notifications via Jobee at your selected times.
              </Text>
            </View>

            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="info" size={16} color="#3b82f6" />
                <Text className="font-quicksand-bold text-blue-800 text-sm">Important</Text>
              </View>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                Make sure Jobee has permission to send you notifications in your device settings.
              </Text>
            </View>

            <TouchableOpacity
              className="bg-emerald-500 rounded-xl py-4 items-center justify-center"
              style={{
                shadowColor: "#16a34a",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={() => setShowNotificationsModal(false)}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Text className="font-quicksand-bold text-white text-base">Close</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 px-6 py-5">
            {validNotificationOptions.length === 0 ? (
              <>
                <View>
                  <View className="flex-col items-center justify-center mb-4">
                    <Text className="font-quicksand-bold text-lg text-center">All Reminder Options Unavailable</Text>
                    <Text className="font-quicksand-semibold text-sm text-center">
                      It looks like all the reminder options for this interview time are in the past. You can close this
                      modal.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-emerald-500 rounded-xl py-4 items-center justify-center"
                  style={{
                    shadowColor: "#16a34a",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() => setShowNotificationsModal(false)}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="font-quicksand-bold text-white text-base">Close</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="flex-col items-center justify-center mb-4">
                  <Text className="font-quicksand-bold text-lg">Register for Notifications</Text>
                  <Text className="font-quicksand-semibold text-sm text-center">
                    Select all the times before the interview you want to be notified
                  </Text>
                </View>
                <View className="flex-row gap-1 flex-wrap">
                  {notificationOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      className={`py-3 px-4 rounded-xl mb-3 ${
                        selectedOptions.includes(option.value) ? "bg-emerald-500" : "bg-gray-100"
                      }`}
                      style={
                        selectedOptions.includes(option.value)
                          ? {
                              shadowColor: "#22c55e",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 4,
                              elevation: 3,
                            }
                          : undefined
                      }
                      onPress={() => {
                        if (selectedOptions.includes(option.value)) {
                          setSelectedOptions(selectedOptions.filter((val) => val !== option.value));
                        } else {
                          setSelectedOptions([...selectedOptions, option.value]);
                        }
                      }}
                    >
                      <Text
                        className={`font-quicksand-medium text-sm ${
                          selectedOptions.includes(option.value) ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  className="bg-emerald-500 rounded-xl py-4 items-center justify-center"
                  style={{
                    shadowColor: "#16a34a",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="font-quicksand-bold text-white text-base">
                      {helpRemember ? "Close" : "Confirm"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ModalWithBg>
    </ScrollView>
  );
};

export default Calendar;
