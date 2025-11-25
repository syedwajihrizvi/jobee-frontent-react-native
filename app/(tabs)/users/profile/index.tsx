import BackBar from "@/components/BackBar";
import ProfileLink from "@/components/ProfileLink";
import RenderUserProfileImage from "@/components/RenderUserProfileImage";
import { userProfileLinks } from "@/constants/index";
import { signOut } from "@/lib/auth";
import { getS3ProfileImage } from "@/lib/s3Urls";
import { updateUserProfileImage } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { isAuthenticated, isLoading, user, removeUser, setUserType } = useAuthStore();
  const [uploadingUserProfileImage, setUploadingUserProfileImage] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string | null>(null);
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

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
    if (isLoading) {
      return <ActivityIndicator size="small" color="#0000ff" />;
    }
    if (uploadedProfileImage) {
      return (
        <Image
          source={{ uri: getS3ProfileImage(uploadedProfileImage) }}
          className="size-14 rounded-full"
          resizeMode="contain"
        />
      );
    }
    return <RenderUserProfileImage user={user as User} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-white h-full pb-20">
      <BackBar label="Profile" />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-20" />
      ) : (
        <View className="p-4">
          <View className="flex flex-row items-center gap-4">
            <TouchableOpacity className="relative" onPress={handleProfileImagePicker}>
              {uploadingUserProfileImage ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <>
                  {renderProfileImage()}
                  <View className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <Entypo name="edit" size={10} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-lg" numberOfLines={1}>
                {(user as User)?.firstName} {(user as User)?.lastName}
              </Text>
              <Text className="font-quicksand-semibold text-sm text-gray-600" numberOfLines={1}>
                {(user as User)?.title}
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
              {userProfileLinks.map((link, index) => (
                <ProfileLink
                  key={index}
                  icon={link.icon}
                  label={link.label}
                  subtitle={link.subtitle}
                  onPress={() => router.push(link.href as any)}
                />
              ))}
              <ProfileLink
                icon={<Feather name="calendar" size={20} color="#10b981" />}
                label="Interviews"
                subtitle="View and manage your interviews"
                onPress={() => router.push(`/userProfile/interviews?userId=${(user as User)?.id}`)}
                rightIcon={true}
              />
              <ProfileLink
                icon={<Feather name="settings" size={20} color="#10b981" />}
                label="Account Settings"
                subtitle="Manage your account settings and preferences"
                onPress={() => console.log("Account Settings Pressed")}
                rightIcon={true}
              />
              <ProfileLink
                icon={<AntDesign name="logout" size={20} color="#10b981" />}
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
