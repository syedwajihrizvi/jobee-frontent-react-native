import { platformLogos } from "@/constants";
import {
  connectToWebexOAuth,
  createWebexMeeting,
  doesUserHaveLicenseToCreateMeeting,
  isWebexTokenValid,
  refreshWebexToken,
} from "@/lib/oauth/webex";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const WebexMeetingCreator = () => {
  const webexMeetLink = null; // Replace with actual state
  const [isConnectedToWebex, setIsConnectedToWebex] = useState(false);
  const [hasMeetingLicense, setHasMeetingLicense] = useState(false);

  useEffect(() => {
    const checkWebexConnection = async () => {
      if (await isWebexTokenValid()) {
        setIsConnectedToWebex(true);
        const hasLicense = await doesUserHaveLicenseToCreateMeeting();
        setHasMeetingLicense(hasLicense);
      } else {
        const res = await refreshWebexToken();
        if (res) {
          setIsConnectedToWebex(true);
          const hasLicense = await doesUserHaveLicenseToCreateMeeting();
          setHasMeetingLicense(hasLicense);
        }
      }
    };
    checkWebexConnection();
  }, []);

  const handleWebexPress = async () => {
    if (!isConnectedToWebex) {
      const result = await connectToWebexOAuth();
      if (result) {
        setIsConnectedToWebex(true);
        const hasLicense = await doesUserHaveLicenseToCreateMeeting();
        setHasMeetingLicense(hasLicense);
      } else {
        Alert.alert("Connection Failed", "Unable to connect to Webex. Please try again.");
      }
    }
  };

  const createWebexMeet = async () => {
    await createWebexMeeting();
  };

  return (
    <View className="p-4">
      {!isConnectedToWebex ? (
        <TouchableOpacity
          className={`rounded-xl p-2 flex-row items-center gap-4 border-2 ${
            isConnectedToWebex ? "bg-blue-50 border-emerald-200" : "bg-emerald-100 border-emerald-300"
          }`}
          style={{
            shadowColor: "#4285F4",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isConnectedToWebex ? 0.15 : 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleWebexPress}
          activeOpacity={0.7}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isConnectedToWebex ? "bg-emerald-100" : "bg-emerald-50 border border-emerald-200"
            }`}
          >
            <Image source={platformLogos.WEBEX} style={{ width: 16, height: 16, borderRadius: 4 }} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-base text-emerald-600">Webex</Text>
              {!isConnectedToWebex && (
                <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                  <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                </View>
              )}
            </View>
            <Text className="font-quicksand-medium text-sm text-emerald-500">
              {isConnectedToWebex
                ? webexMeetLink
                  ? `Webex Meeting Created`
                  : "Select a Webex Meeting"
                : "Connect to Webex to create meetings"}
            </Text>
          </View>
          {isConnectedToWebex && (
            <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      ) : !hasMeetingLicense ? (
        <>
          <View className="flex-col items-center justify-center gap-2 rounded-xl p-4">
            <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
              <Entypo name="emoji-sad" size={28} color="#EF4444" />
            </View>
            <View>
              <Text className="font-quicksand-bold text-lg text-red-700 text-center">
                Unable to Create Webex Meeting
              </Text>
              <Text className="font-quicksand-medium text-md text-red-600 text-center">
                Connected to Webex, but your account lacks the required license to create meetings.
                <Text className="font-quicksand-bold text-red-700"> Please upgrade your Webex plan.</Text>
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View className="flex-col items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <AntDesign name="check-circle" size={24} color="#10B981" />
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-emerald-700 text-center">Connected to Webex</Text>
            <Text className="font-quicksand-medium text-md text-emerald-600 text-center">
              When you create the interview, a Webex meeting will be automatically generated and the link will be sent
              to all parties.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default WebexMeetingCreator;
