import {
  connectToOneDriveOAuth,
  createTeamsMeeting,
  isMicrosoftTokenValid,
  refreshMicrosoftToken,
  userHasTeamsLicense,
} from "@/lib/oauth/onedrive";
import { AntDesign, Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const MicrosoftTeamsMeetingCreator = () => {
  const microsoftTeamsLink = null;
  const activeOAuthProvider = null;
  const [isConnectedToMicrosoftTeams, setIsConnectedToMicrosoftTeams] = useState(false);
  const [hasMeetingLicense, setHasMeetingLicense] = useState(false);

  useEffect(() => {
    const checkMicrosoftTeamsAccessToken = async () => {
      if (await isMicrosoftTokenValid()) {
        setIsConnectedToMicrosoftTeams(true);
        const hasLicense = await userHasTeamsLicense();
        setHasMeetingLicense(hasLicense);
      } else {
        const res = await refreshMicrosoftToken();
        if (res) {
          setIsConnectedToMicrosoftTeams(true);
          const hasLicense = await userHasTeamsLicense();
          setHasMeetingLicense(hasLicense);
        }
      }
    };
    checkMicrosoftTeamsAccessToken();
  }, []);

  const handleOneDrivePress = async () => {
    if (!isConnectedToMicrosoftTeams) {
      const result = await connectToOneDriveOAuth("organizations");
      if (result) {
        setIsConnectedToMicrosoftTeams(true);
        const hasLicense = await userHasTeamsLicense();
        setHasMeetingLicense(hasLicense);
      } else {
        Alert.alert("Connection Failed", "Unable to connect to OneDrive. Please try again.");
      }
    }
  };

  const createMicrosoftTeamsMeeting = async () => {
    await createTeamsMeeting();
  };

  return (
    <View className="p-4">
      {!isConnectedToMicrosoftTeams ? (
        <TouchableOpacity
          className={`rounded-xl p-2 flex-row items-center gap-4 border-2 ${
            isConnectedToMicrosoftTeams ? "bg-blue-50 border-purple-200" : "bg-purple-100 border-purple-300"
          }`}
          style={{
            shadowColor: "#4285F4",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isConnectedToMicrosoftTeams ? 0.15 : 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={handleOneDrivePress}
          activeOpacity={0.7}
        >
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isConnectedToMicrosoftTeams ? "bg-purple-100" : "bg-purple-50 border border-purple-200"
            }`}
          >
            <MaterialCommunityIcons name="microsoft-teams" size={20} color="purple" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-quicksand-bold text-base text-purple-600">Mircosoft Teams</Text>
              {!isConnectedToMicrosoftTeams && (
                <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                  <Text className="font-quicksand-bold text-xs text-amber-600">Secure</Text>
                </View>
              )}
            </View>
            <Text className="font-quicksand-medium text-sm text-purple-500">
              {isConnectedToMicrosoftTeams
                ? microsoftTeamsLink
                  ? `Microsoft Teams Meeting Created`
                  : "Select a Microsoft Teams Meeting"
                : "Connect to Microsoft Teams to create meetings"}
            </Text>
          </View>
          {isConnectedToMicrosoftTeams && microsoftTeamsLink && activeOAuthProvider === "GOOGLE_DRIVE" && (
            <View className="w-6 h-6 bg-purple-500 rounded-full items-center justify-center">
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      ) : !hasMeetingLicense ? (
        <View className="flex-col items-center justify-center gap-3 borderrounded-xl p-3">
          <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
            <Entypo name="emoji-sad" size={28} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-red-700 text-center">Connected to Microsoft</Text>
            <Text className="font-quicksand-medium text-md text-red-600 text-center">
              You are connected, but do not have a license to create Microsoft Teams meetings. To create meetings,
              Microsoft requires an organizational or business account with a Teams license.
            </Text>
          </View>
        </View>
      ) : (
        <View className="flex-col items-center justify-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
          <AntDesign name="check-circle" size={24} color="#10B981" />
          <View className="flex-1">
            <Text className="font-quicksand-bold text-lg text-purple-700 text-center">Connected to Mircrosoft</Text>
            <Text className="font-quicksand-medium text-md text-purple-600 text-center">
              When you create the interview, a Microsoft Teams meeting will be automatically generated and the link will
              be sent to all parties.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MicrosoftTeamsMeetingCreator;
