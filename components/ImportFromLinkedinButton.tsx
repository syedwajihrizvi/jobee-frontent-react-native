import { Feather } from "@expo/vector-icons";
import { useAuthRequest } from "expo-auth-session";
import React, { useEffect } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const LINKEDIN_CLIENT_ID = "";
const REDIRECT_URI = "https://dauntless-aron-unprobationary.ngrok-free.dev/oauth2/linkedin/callback";

const discovery = {
  authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
  tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
};

export default function ImportFromLinkedInButton() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: LINKEDIN_CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ["r_liteprofile", "r_emailaddress"],
      responseType: "code",
    },
    discovery
  );

  // Handle successful redirect
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("LinkedIn Auth Code:", code);
      fetch("https://dauntless-aron-unprobationary.ngrok-free.dev/auth/linkedin/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => console.log("LinkedIn profile:", data))
        .catch((err) => console.error("Error exchanging code:", err));
    }
  }, [response]);

  // Function to trigger login when user presses button
  const handleImportFromLinkedIn = async () => {
    Alert.alert("Import from LinkedIn", "This feature is currently under development.");
    if (!request) return;
    // console.log(request);
    // await promptAsync();
  };

  return (
    <TouchableOpacity
      className="rounded-xl p-4 flex-row items-center justify-center gap-3 mb-3 overflow-hidden"
      style={{
        backgroundColor: "#0A66C2",
        shadowColor: "#0A66C2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
      activeOpacity={0.9}
      onPress={handleImportFromLinkedIn}
    >
      {/* LinkedIn Logo */}
      <View className="w-8 h-8 bg-white rounded-sm items-center justify-center">
        <Text className="font-bold text-[#0A66C2] text-base" style={{ fontFamily: "System" }}>
          in
        </Text>
      </View>

      <View className="flex-1 items-center">
        <Text className="font-quicksand-bold text-white text-base">Import from LinkedIn</Text>
        <Text className="font-quicksand-medium text-blue-100 text-xs mt-0.5">Auto-fill your resume</Text>
      </View>

      <View className="w-6 h-6 border border-white/40 rounded-full items-center justify-center">
        <Feather name="arrow-right" size={14} color="white" />
      </View>
    </TouchableOpacity>
  );
}
