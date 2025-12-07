import { connectToGoogleDriveOAuth, isGoogleDriveAccessTokenValid, refreshGoogleToken } from "@/lib/oauth/google";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const GoogleMeetingCreator = () => {
  const googleMeetLink = null; // Replace with actual state
  const activeOAuthProvider = null; // Replace with actual state
  const [isConnectedToGoogleDrive, setIsConnectedToGoogleDrive] = useState(false);

  useEffect(() => {
    const checkGoogleToken = async () => {
      if (await isGoogleDriveAccessTokenValid()) {
        setIsConnectedToGoogleDrive(true);
      } else {
        const res = await refreshGoogleToken();
        if (res) {
          setIsConnectedToGoogleDrive(true);
        }
      }
    };
    checkGoogleToken();
  }, []);

  const handleGooglePress = async () => {
    if (!isConnectedToGoogleDrive) {
      const result = await connectToGoogleDriveOAuth();
      if (result) {
        setIsConnectedToGoogleDrive(true);
      } else {
        Alert.alert("Connection Failed", "Unable to connect to Google. Please try again.");
      }
    }
  };

  return (
    <View className="p-4">
      {!isConnectedToGoogleDrive ? (
        <TouchableOpacity
          className={`rounded-xl p-2 flex-row items-center gap-4 border-2 ${
            isConnectedToGoogleDrive ? "bg-blue-50 border-emerald-200" : "bg-emerald-100 border-emerald-300"
          }`}
          style={{
            shadowColor: "#4285F4",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isConnectedToGoogleDrive ? 0.15 : 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleGooglePress}
          activeOpacity={0.7}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isConnectedToGoogleDrive ? "bg-emerald-100" : "bg-emerald-50 border border-emerald-200"
            }`}
          >
            <AntDesign name="google" size={20} color="#10B981" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-base text-emerald-600">Google Meet</Text>
              {!isConnectedToGoogleDrive && (
                <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                  <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                </View>
              )}
            </View>
            <Text className="font-quicksand-medium text-sm text-emerald-500">
              {isConnectedToGoogleDrive
                ? googleMeetLink
                  ? `Google Meet Created`
                  : "Select a Google Drive File"
                : "Connect to Google Drive to create meetings"}
            </Text>
          </View>
          {isConnectedToGoogleDrive && googleMeetLink && activeOAuthProvider === "GOOGLE_DRIVE" && (
            <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View className="flex-col items-center justify-center gap-3 rounded-xl p-3">
          <AntDesign name="check-circle" size={32} color="#10B981" />
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-emerald-700 text-center">Connected to Google</Text>
            <Text className="font-quicksand-medium text-emerald-600 text-center text-md">
              When you create the interview, a Google Meet will be automatically generated and the link will be sent to
              all parties.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default GoogleMeetingCreator;
