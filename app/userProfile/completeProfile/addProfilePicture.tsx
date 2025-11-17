import { images } from "@/constants";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  uploadedProfileImage: ImagePicker.ImagePickerResult | null;
  setUploadedProfileImage: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerResult | null>>;
};

const AddProfilePicture = ({ uploadedProfileImage, setUploadedProfileImage }: Props) => {
  const renderProfileImageUri = () => {
    if (uploadedProfileImage && uploadedProfileImage.assets && uploadedProfileImage.assets.length > 0) {
      return uploadedProfileImage.assets[0].uri;
    }
    return images.companyLogo;
  };

  const handleProfileImageCamera = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow camera access to change profile picture.");
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
    });

    if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
      setUploadedProfileImage(cameraResult);
    }
  };

  const handleProfileImagePicker = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow gallery access to upload a profile picture.");
      return;
    }

    const galleryResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.8,
    });

    if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
      setUploadedProfileImage(galleryResult);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Profile Picture", "Choose how you'd like to add your profile picture", [
      { text: "Take Photo", onPress: handleProfileImageCamera },
      { text: "Choose from Gallery", onPress: handleProfileImagePicker },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 py-8">
        {/* Header Section */}
        <View className="items-center mb-8">
          <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-2">Add Your Profile Picture</Text>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-5 text-base">
            Add a professional photo to help employers recognize you and make a great first impression
          </Text>
        </View>

        <View className="items-center mb-8">
          <View
            className="relative mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Image
              source={{ uri: renderProfileImageUri() }}
              className="w-24 h-24 rounded-full border-4 border-white"
              resizeMode="cover"
            />

            <TouchableOpacity
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full items-center justify-center border-4 border-white"
              style={{
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
              }}
              onPress={showImageOptions}
            >
              <Feather name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Status Indicator */}
          {uploadedProfileImage ? (
            <View className="bg-emerald-50 border border-green-200 rounded-xl px-4 py-2">
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={16} color="#22c55e" />
                <Text className="font-quicksand-semibold text-green-700 text-sm">Photo uploaded successfully!</Text>
              </View>
            </View>
          ) : (
            <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
              <View className="flex-row items-center gap-2">
                <Feather name="info" size={16} color="#3b82f6" />
                <Text className="font-quicksand-medium text-blue-700 text-sm">
                  Tap the camera icon to add your photo
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          <TouchableOpacity
            className="bg-emerald-500 py-4 rounded-xl flex-row items-center justify-center"
            style={{
              shadowColor: "#22c55e",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
            onPress={showImageOptions}
            activeOpacity={0.8}
          >
            <Feather name="upload" size={18} color="white" />
            <Text className="text-white font-quicksand-bold text-base ml-2">
              {uploadedProfileImage ? "Change Photo" : "Add Profile Picture"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
          <Text className="font-quicksand-bold text-gray-800 text-sm mb-3">📸 Photo Tips:</Text>
          <View className="gap-2">
            <Text className="font-quicksand-medium text-gray-600 text-xs">• Use a clear, recent photo of yourself</Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Face the camera directly with good lighting
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Dress professionally as you would for an interview
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Avoid group photos or heavily filtered images
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddProfilePicture;
