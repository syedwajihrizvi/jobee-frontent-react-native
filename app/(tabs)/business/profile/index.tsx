import BackBar from "@/components/BackBar";
import ProfileLink from "@/components/ProfileLink";
import RenderBusinessProfileImage from "@/components/RenderBusinessProfileImage";
import { adminOnlyProfileLinks, businessProfileLinks, recruiterOnlyProfileLinks } from "@/constants/index";
import { signOut } from "@/lib/auth";
import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { updateBusinessProfileImage } from "@/lib/updateProfiles/businessProfile";
import useApplicationStore from "@/store/applications.store";
import useAuthStore from "@/store/auth.store";
import useBusinessInterviewsStore from "@/store/businessInterviews.store";
import useBusinessJobsStore from "@/store/businessJobs.store";
import useBusinessUserStore from "@/store/businessUser.store";
import useCompanyStore from "@/store/company.store";
import useCompleteProfileStore from "@/store/completeProfile.store";
import useConversationStore from "@/store/conversation.store";
import useNotificationStore from "@/store/notifications.store";
import useOAuthDocStore from "@/store/oauth-doc.store";
import { BusinessUser } from "@/type";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const {
    isAuthenticated,
    isLoading,
    user: authUser,
    removeUser,
    setUserType,
    updateUserProfileImage,
  } = useAuthStore();

  const [uploadingUserProfileImage, setUploadingUserProfileImage] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string | null>(null);
  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

  const user = authUser as BusinessUser | null;

  const getProfileLinks = () => {
    let profileLinks = [...businessProfileLinks];
    if (user?.role === "ADMIN") {
      profileLinks = [...adminOnlyProfileLinks, ...recruiterOnlyProfileLinks, ...profileLinks];
    }
    if (user?.role === "RECRUITER") {
      profileLinks = [...recruiterOnlyProfileLinks, ...profileLinks];
    }
    return profileLinks;
  };

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
      const response = await updateBusinessProfileImage(image);
      if (response) {
        Alert.alert("Success", "Profile image updated successfully.");
        console.log("Updated Profile Image URL:", response.profileImageUrl);
        setUploadedProfileImage(response.profileImageUrl);
        console.log(response);
        updateUserProfileImage(response.profileImageUrl);
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
          // Reset all stores
          removeUser();
          useBusinessJobsStore.getState().reset();
          useBusinessInterviewsStore.getState().reset();
          useApplicationStore.getState().reset();
          useBusinessUserStore.getState().reset();
          useCompanyStore.getState().reset();
          useCompleteProfileStore.getState().resetState();
          useConversationStore.getState().reset();
          useNotificationStore.getState().reset();
          useOAuthDocStore.getState().resetState();
          setUserType("user");
          router.push("/(auth)/sign-in");
        },
      },
    ]);
  };

  const renderProfileImage = () => {
    if (uploadedProfileImage) {
      return (
        <Image
          source={{ uri: getS3BusinessProfileImage(uploadedProfileImage) }}
          className="size-14 rounded-full"
          resizeMode="contain"
        />
      );
    } else if (!user || !user.profileImageUrl) {
      return (
        <RenderBusinessProfileImage
          profileImageSize={14}
          fontSize={14}
          firstName={user?.firstName}
          lastName={user?.lastName}
        />
      );
    }
    const uri = getS3BusinessProfileImage(user.profileImageUrl);
    return <Image source={{ uri }} className="size-14 rounded-full" resizeMode="contain" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-white h-full pb-20">
      <BackBar label="Profile" />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-20" />
      ) : (
        <View className="p-4">
          <View className="mb-2">
            <View
              className="bg-white rounded-xl p-4 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center gap-3">
                <TouchableOpacity className="relative" onPress={handleProfileImagePicker}>
                  {uploadingUserProfileImage ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : (
                    <>
                      <View
                        className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center border-3 border-white"
                        style={{
                          shadowColor: "#10b981",
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.2,
                          shadowRadius: 6,
                          elevation: 4,
                        }}
                      >
                        {renderProfileImage()}
                      </View>

                      <View className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                        <Entypo name="edit" size={10} color="white" />
                      </View>
                    </>
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-quicksand-bold text-md text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <View className="w-5 h-5 bg-emerald-500 rounded-full items-center justify-center">
                      <Feather name="star" size={10} color="white" />
                    </View>
                  </View>
                  <Text className="font-quicksand-bold text-sm text-gray-600">
                    {user?.title ? `${user?.title} @` : ""} {user?.companyName}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-emerald-500 rounded-lg px-4 py-2 flex-row items-center justify-center gap-2 mt-3 w-1/2"
                onPress={() => router.push(`/companies/${user?.companyId}`)}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="building" size={12} color="white" />
                <Text className="font-quicksand-bold text-white text-xs">View Company Profile</Text>
                <Feather name="arrow-right" size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            className="mt-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex flex-col gap-4 pb-20">
              {!user?.verified && (
                <ProfileLink
                  icon={<Feather name="check" size={20} color="#10b981" />}
                  label="Verified Account"
                  subtitle="Your account is verified"
                  onPress={() => console.log("Account Settings Pressed")}
                />
              )}
              {getProfileLinks().map((link, index) => (
                <ProfileLink
                  key={index}
                  icon={link.icon}
                  label={link.label}
                  subtitle={link.subtitle}
                  onPress={() => router.push(link.href as any)}
                />
              ))}
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
