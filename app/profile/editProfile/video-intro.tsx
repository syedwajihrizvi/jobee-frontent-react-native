import BackBar from "@/components/BackBar";
import UserVideoIntro from "@/components/UserVideoIntro";
import { getS3VideoIntroUrl } from "@/lib/s3Urls";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VideoIntro = () => {
  const { user: authUser } = useAuthStore();
  const user = authUser as User | null;

  const handleDeleteVideo = () => {
    // Handle video deletion
    console.log("Delete video");
  };

  const handleUploadNewVideo = async () => {
    // Handle new video upload
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) {
      Alert.alert(
        "Permission Denied",
        "Please allow Jobee to access your media library in settings to upload a video introduction.",
        [
          {
            text: "Go to Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
    Alert.alert("Upload Video Intro", "Upload a video intro for your profile", [
      {
        text: "Choose from Library",
        onPress: async () => {
          const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "videos",
            allowsEditing: true,
            videoMaxDuration: 90,
            aspect: [4, 3],
            quality: 1,
          });
          if (!pickerResult.canceled && pickerResult.assets.length > 0) {
            console.log("Selected video:", pickerResult.assets[0].uri);
          }
        },
      },
      {
        text: "Record Video",
        onPress: async () => {
          const cameraResult = await ImagePicker.launchCameraAsync({
            mediaTypes: "videos",
            allowsEditing: true,
            videoMaxDuration: 90,
            aspect: [4, 3],
            quality: 1,
          });
          if (!cameraResult.canceled && cameraResult.assets.length > 0) {
            console.log("Recorded video:", cameraResult.assets[0].uri);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <BackBar label="Video Introduction" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">
              View and update your video introduction
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              When employers view your profile, a video introduction can help you stand out and make a memorable
              impression. Consider recording a brief video to showcase your personality, communication skills, and
              enthusiasm for your field.
            </Text>
          </View>
        </View>

        <View className="px-6 pb-6">
          {user?.videoIntroUrl ? (
            <View
              className="bg-white rounded-2xl overflow-hidden border border-gray-200"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <View className="relative">
                <UserVideoIntro videoSource={getS3VideoIntroUrl(user?.videoIntroUrl)} />

                <View className="absolute top-4 left-4">
                  <View className="bg-black/70 px-3 py-1 rounded-full">
                    <Text className="font-quicksand-semibold text-white text-xs">Your Introduction</Text>
                  </View>
                </View>
              </View>

              <View className="p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-lg text-gray-800 mb-1">Video Introduction</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="w-2 h-2 bg-green-500 rounded-full" />
                      <Text className="font-quicksand-medium text-sm text-gray-600">Active on your profile</Text>
                    </View>
                  </View>
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                    <Feather name="video" size={20} color="#22c55e" />
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 py-3 rounded-xl flex-row items-center justify-center"
                    style={{
                      shadowColor: "#3b82f6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={handleUploadNewVideo}
                  >
                    <Feather name="upload" size={16} color="white" />
                    <Text className="font-quicksand-semibold text-white text-sm ml-2">Replace Video</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-red-500 py-3 rounded-xl flex-row items-center justify-center"
                    style={{
                      shadowColor: "#ef4444",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={handleDeleteVideo}
                  >
                    <Feather name="trash-2" size={16} color="white" />
                    <Text className="font-quicksand-semibold text-white text-sm ml-2">Delete</Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <View className="flex-row items-start gap-3">
                    <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                      <Feather name="info" size={12} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-blue-800 text-sm mb-1">Video Tips</Text>
                      <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                        Keep it under 60 seconds, introduce yourself clearly, and highlight your key strengths.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center border border-gray-200">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Feather name="video" size={24} color="#9ca3af" />
              </View>
              <Text className="font-quicksand-bold text-gray-800 text-lg mb-2">No Video Introduction</Text>
              <Text className="font-quicksand-medium text-gray-500 text-center text-sm leading-5 mb-6">
                Showcase your personality and communication skills with a video introduction that helps you stand out
              </Text>
              <TouchableOpacity
                className="bg-green-500 px-8 py-4 rounded-xl flex-row items-center"
                style={{
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }}
                onPress={handleUploadNewVideo}
              >
                <Feather name="video" size={18} color="white" />
                <Text className="font-quicksand-semibold text-white text-base ml-2">Record Video Introduction</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VideoIntro;
