import {
  connectToGoogleDriveOAuth,
  deleteGoogleCalendarEvent,
  isGoogleDriveAccessTokenValid,
  refreshGoogleToken,
} from "@/lib/oauth/google";
import {
  connectToZoomOAuth,
  deleteZoomMeeting,
  isZoomAccessTokenValid,
  refreshZoomAccessToken,
} from "@/lib/oauth/zoom";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import ModalWithBg from "./ModalWithBg";
import RenderMeetingPlatformIcon from "./RenderMeetingPlatformIcon";

type Props = {
  show: boolean;
  onlineMeetingInformation: any;
  handleClose: () => void;
};

const DeleteOnlineMeetingOnPlatform = ({ show, onlineMeetingInformation, handleClose }: Props) => {
  const [isDeletingOnlineMeeting, setIsDeletingOnlineMeeting] = useState(false);

  const handleCancelGoogleMeet = async () => {
    const connectedToGoogleDrive = await isGoogleDriveAccessTokenValid();
    if (!connectedToGoogleDrive) {
      const res = await refreshGoogleToken();
      if (!res) {
        await connectToGoogleDriveOAuth();
      }
    }
    setIsDeletingOnlineMeeting(true);
    try {
      const result = await deleteGoogleCalendarEvent(onlineMeetingInformation.eventId);
      if (result) {
        Alert.alert("Success", "Google Meet cancelled successfully.");
      } else {
        Alert.alert("Error", "Failed to cancel the Google Meet Please try again.");
      }
      handleClose();
    } catch (error) {
      Alert.alert("Error", "An error occurred while cancelling the Google Meet meeting. Please try again.");
    } finally {
      setIsDeletingOnlineMeeting(false);
    }
  };

  const handleCancelZoomMeeting = async () => {
    const connectedToZoom = await isZoomAccessTokenValid();
    if (!connectedToZoom) {
      const res = await refreshZoomAccessToken();
      if (!res) {
        await connectToZoomOAuth();
      }
    }

    setIsDeletingOnlineMeeting(true);
    try {
      const result = await deleteZoomMeeting(onlineMeetingInformation.meetingId);
      if (result) {
        Alert.alert("Success", "Zoom meeting cancelled successfully.");
      } else {
        Alert.alert("Error", "Failed to cancel the Zoom meeting. Please try again.");
      }
      handleClose();
    } catch (error) {
      console.log("Error cancelling Zoom meeting: ", error);
      Alert.alert("Error", "An error occurred while cancelling the Zoom meeting. Please try again.");
    } finally {
      setIsDeletingOnlineMeeting(false);
    }
  };
  return (
    <ModalWithBg visible={show} customHeight={0.4} customWidth={0.9}>
      <View className="flex-row justify-between items-center px-4 py-2 border-b border-gray-200">
        <TouchableOpacity onPress={handleClose} className="p-2">
          <Feather name="x" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
      <View className="justify-center mt-4 items-center px-6">
        <Text className="font-quicksand-bold text-xl text-gray-900 mb-4 text-center">
          Online Interview Meeting Cancellation
        </Text>
        {onlineMeetingInformation.interviewMeetingPlatform === "OTHER" && (
          <View>
            <Text>
              Please be sure to also cancel the interview on the respective platform to avoid any confusion for the
              candidate.
            </Text>
          </View>
        )}
        {onlineMeetingInformation.interviewMeetingPlatform === "GOOGLE_MEET" && (
          <View>
            <Text className="font-quicksand-medium text-base text-gray-700 mb-4 text-center">
              Do you want to cancel the previous Google Meet associated with this interview? Highly recommended to avoid
              confusion for the candidate.
            </Text>
            <TouchableOpacity
              className="bg-emerald-500 flex-row items-center justify-center gap-3 px-3 py-4 rounded-lg"
              disabled={isDeletingOnlineMeeting}
              style={{
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={handleCancelGoogleMeet}
            >
              {isDeletingOnlineMeeting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="font-quicksand-bold text-white text-xl text-center">Cancelling...</Text>
                </>
              ) : (
                <>
                  <RenderMeetingPlatformIcon
                    platformType="GOOGLE_MEET"
                    platformColor="#3b82f6"
                    size={30}
                    active={false}
                  />
                  <Text className="font-quicksand-bold text-white text-xl text-center">Cancel Google Meet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        {onlineMeetingInformation.interviewMeetingPlatform === "ZOOM" && (
          <View>
            <Text className="font-quicksand-medium text-base text-gray-700 mb-4 text-center">
              Do you want to cancel the previous Zoom meeting associated with this interview? Highly recommended to
              avoid confusion for the candidate.
            </Text>
            <TouchableOpacity
              className="bg-emerald-500 flex-row items-center justify-center gap-3 px-3 py-4 rounded-lg"
              disabled={isDeletingOnlineMeeting}
              style={{
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={handleCancelZoomMeeting}
            >
              {isDeletingOnlineMeeting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="font-quicksand-bold text-white text-xl text-center">Cancelling...</Text>
                </>
              ) : (
                <>
                  <RenderMeetingPlatformIcon platformType="ZOOM" platformColor="#3b82f6" size={30} active={false} />
                  <Text className="font-quicksand-bold text-white text-xl text-center">Cancel Zoom Meeting</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ModalWithBg>
  );
};

export default DeleteOnlineMeetingOnPlatform;
