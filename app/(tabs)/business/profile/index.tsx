import BackBar from "@/components/BackBar";
import ProfileLink from "@/components/ProfileLink";
import { businessProfileLinks, images } from "@/constants/index";
import { signOut } from "@/lib/auth";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { updateUserProfileImage } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { BusinessUser } from "@/type";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { isAuthenticated, isLoading, user: authUser, removeUser, setUserType } = useAuthStore();
  const [uploadingUserProfileImage, setUploadingUserProfileImage] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string | null>(null);
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  const user = authUser as BusinessUser | null;
  console.log("Business User:", user);
  const handleProfileImagePicker = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow camera access to change profile picture.");
      return;
    }
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const cameraResult = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
            await uploadUserProfileImage(cameraResult);
          }
          return;
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
            await uploadUserProfileImage(galleryResult);
          }
          return;
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadUserProfileImage = async (image: ImagePicker.ImagePickerResult) => {
    if (!image || !image.assets || image.assets.length === 0) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;
    }
    setUploadingUserProfileImage(true);
    try {
      const response = await updateUserProfileImage(image);
      if (response) {
        Alert.alert("Success", "Profile image updated successfully.");
        setUploadedProfileImage(response.profileImageUrl);
      } else {
        Alert.alert("Error", "Failed to update profile image. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the profile image. Please try again.");
    } finally {
      setUploadingUserProfileImage(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          removeUser();
          setUserType("user");
          router.push("/(auth)/sign-in");
        },
      },
    ]);
  };

  const renderProfileImage = () => {
    if (!user || !user.profileImageUrl) {
      return <Image source={{ uri: images.companyLogo }} className="size-14 rounded-full" resizeMode="contain" />;
    } else if (uploadedProfileImage) {
      return (
        <Image
          source={{ uri: getS3ProfileImage(uploadedProfileImage) }}
          className="size-14 rounded-full"
          resizeMode="contain"
        />
      );
    }
    const uri = getS3ProfileImage(user.profileImageUrl);
    return <Image source={{ uri }} className="size-14 rounded-full" resizeMode="contain" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-white h-full pb-20">
      <BackBar label="Profile" />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-20" />
      ) : (
        <View className="p-4">
          <View className="flex flex-col items-center">
            <TouchableOpacity className="relative" onPress={handleProfileImagePicker}>
              {uploadingUserProfileImage ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <>
                  {renderProfileImage()}
                  <Entypo
                    name="edit"
                    size={16}
                    color="black"
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                  />
                </>
              )}
            </TouchableOpacity>
            <View className="mt-1 items-center">
              <View className="flex-row items-center gap-1">
                <Text className="font-quicksand-bold text-lg">
                  {user?.firstName} {user?.lastName}
                </Text>
                {user?.verified && (
                  <View className="w-4 h-4 bg-green-500 rounded-full items-center justify-center">
                    <MaterialIcons name="check" size={10} color="white" />
                  </View>
                )}
              </View>
              <Text className="font-quicksand-semibold text-sm">
                {user?.title} @ {user?.companyName}
              </Text>
            </View>
          </View>
          <View className="divider" />
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            className="mt-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex flex-col gap-4 pb-20">
              {!user?.verified && (
                <ProfileLink
                  icon={<Feather name="check" size={20} />}
                  label="Verified Account"
                  subtitle="Your account is verified"
                  onPress={() => console.log("Account Settings Pressed")}
                />
              )}
              {businessProfileLinks.map((link, index) => (
                <ProfileLink
                  key={index}
                  icon={link.icon}
                  label={link.label}
                  subtitle={link.subtitle}
                  onPress={() => router.push(link.href as any)}
                />
              ))}
              <ProfileLink
                icon={<Feather name="settings" size={20} />}
                label="Account Settings"
                subtitle="Manage your account settings and preferences"
                onPress={() => console.log("Account Settings Pressed")}
                rightIcon={true}
              />
              <ProfileLink
                icon={<AntDesign name="logout" size={20} />}
                label="Sign Out"
                onPress={handleSignOut}
                rightIcon={false}
              />
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;
