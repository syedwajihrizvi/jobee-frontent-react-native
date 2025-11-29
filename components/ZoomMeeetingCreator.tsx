import { platformLogos } from "@/constants";
import {
  connectToZoomOAuth,
  createZoomMeeting,
  isZoomAccessTokenValid,
  refreshZoomAccessToken,
} from "@/lib/oauth/zoom";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const ZoomMeetingCreator = () => {
  const zoomMeetLink = null;
  const activeOAuthProvider = null;
  const [isConnectedToZoom, setIsConnectedToZoom] = useState(false);

  useEffect(() => {
    const checkGoogleDriveAccessToken = async () => {
      if (await isZoomAccessTokenValid()) {
        setIsConnectedToZoom(true);
      } else {
        const res = await refreshZoomAccessToken();
        if (res) {
          setIsConnectedToZoom(true);
        }
      }
    };
    checkGoogleDriveAccessToken();
  }, []);

  const handleZoomPress = async () => {
    if (!isConnectedToZoom) {
      const res = await connectToZoomOAuth();
      if (res) {
        setIsConnectedToZoom(true);
      } else {
        Alert.alert("Connection Failed", "Unable to connect to Zoom. Please try again.");
      }
    }
  };

  const createMeeting = async () => {
    await createZoomMeeting();
  };

  return (
    <View className="p-4">
      {!isConnectedToZoom ? (
        <TouchableOpacity
          className={`rounded-xl p-2 flex-row items-center gap-4 border-2 ${
            isConnectedToZoom ? "bg-blue-50 border-blue-200" : "bg-blue-100 border-blue-300"
          }`}
          style={{
            shadowColor: "#4285F4",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isConnectedToZoom ? 0.15 : 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleZoomPress}
          activeOpacity={0.7}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isConnectedToZoom ? "bg-blue-100" : "bg-blue-50 border border-blue-200"
            }`}
          >
            <Image source={platformLogos.ZOOM} style={{ width: 16, height: 16, borderRadius: 4 }} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-base text-blue-600">Zoom</Text>
              {!isConnectedToZoom && (
                <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                  <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                </View>
              )}
            </View>
            <Text className="font-quicksand-medium text-sm text-blue-500">
              {isConnectedToZoom
                ? zoomMeetLink
                  ? `Zoom meeet Created`
                  : "Select a Google Drive File"
                : "Connect to Zoom to create meetings"}
            </Text>
          </View>
          {isConnectedToZoom && zoomMeetLink && activeOAuthProvider === "GOOGLE_DRIVE" && (
            <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View className="flex-col items-center justify-center gap-3 rounded-xl p-3">
          <AntDesign name="check-circle" size={30} color="#3B82F6" />
          <View className="flex-1">
            <Text className="font-quicksand-bold text-blue-700 text-center text-lg">Connected to Zoom</Text>
            <Text className="font-quicksand-medium text-md text-blue-600 text-center">
              When you create the interview, a Zoom Meeting will be automatically generated and the link will be sent to
              all parties.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ZoomMeetingCreator;
