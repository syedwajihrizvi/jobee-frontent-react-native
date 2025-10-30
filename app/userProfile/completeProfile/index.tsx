import BackBar from "@/components/BackBar";
import { sounds } from "@/constants";
import {
  processDropboxUpload,
  processGoogleDriveUpload,
  processOneDriveUpload,
  sendDocumentLinkToServer,
  uploadUserDocument,
} from "@/lib/manageUserDocs";
import { completeProfile } from "@/lib/updateUserProfile";
import { isValidGoogleDriveLink } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import useCompleteProfileStore from "@/store/completeProfile.store";
import { CompleteProfileForm } from "@/type";
import { useAudioPlayer } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { ReactNode, useState } from "react";
import { Alert, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AddGeneralInfo from "./addGeneralInfo";
import AddProfilePicture from "./addProfilePicture";
import AddResume from "./addResume";
import AddVideoIntro from "./addVideoIntro";
import AllSet from "./allSet";

const CompleteProfile = () => {
  const { fetchAuthenticatedUser } = useAuthStore();
  const width = Dimensions.get("window").width;
  const player = useAudioPlayer(sounds.popSound);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [uploadedVideoIntro, setUploadedVideoIntro] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const { uploadMethod, documentTitle, uploadedDocument, documentLink, googleDriveFile, dropboxFile, oneDriveFile } =
    useCompleteProfileStore();
  const [detailsForm, setDetailsForm] = useState<CompleteProfileForm>({
    title: "",
    city: "",
    country: "",
    summary: "",
    phoneNumber: "",
  });
  const [step, setSteps] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const translateX = useSharedValue(0);
  console.log("Complete Profile Store State:", {
    uploadMethod,
    documentTitle,
    uploadedDocument,
    documentLink,
    googleDriveFile,
    dropboxFile,
    oneDriveFile,
  });
  const handleGoogleDriveUpload = async () => {
    if (!googleDriveFile) return;
    try {
      await processGoogleDriveUpload(googleDriveFile, "RESUME", documentTitle);
    } catch (error) {
      console.log("Error uploading Google Drive document:", error);
      Alert.alert("Error", "An error occurred while uploading the Google Drive document.");
    }
  };

  const handleDropboxUpload = async () => {
    if (!dropboxFile) return;
    try {
      await processDropboxUpload(dropboxFile, "RESUME", documentTitle);
    } catch (error) {
      console.log("Error uploading Dropbox document:", error);
      Alert.alert("Error", "An error occurred while uploading the Dropbox document.");
    }
  };

  const handleOneDriveUpload = async () => {
    if (!oneDriveFile) return;
    try {
      await processOneDriveUpload(oneDriveFile, "RESUME", documentTitle);
    } catch (error) {
      console.log("Error uploading OneDrive file:", error);
      Alert.alert("Error", "An error occurred while uploading the OneDrive file.");
    }
  };

  const handleDone = async () => {
    setIsSubmitting(true);
    const selectedDocumentType = "RESUME";
    try {
      // Upload resume first via endpoint
      if (uploadMethod === "DIRECT_UPLOAD" && uploadedDocument) {
        await uploadUserDocument(uploadedDocument, selectedDocumentType, documentTitle);
      } else if (uploadMethod === "LINK_INPUT" && documentLink.trim() !== "") {
        const documentLinkType = isValidGoogleDriveLink(documentLink) ? "GOOGLE_DRIVE" : "DROPBOX";
        await sendDocumentLinkToServer(documentLink, selectedDocumentType, documentTitle, documentLinkType);
      } else if (uploadMethod === "GOOGLE_DRIVE") {
        await handleGoogleDriveUpload();
      } else if (uploadMethod === "DROPBOX") {
        await handleDropboxUpload();
      } else if (uploadMethod === "ONEDRIVE") {
        await handleOneDriveUpload();
      }
      const res = await completeProfile(uploadedProfileImage!, uploadedVideoIntro!, detailsForm);
      if (res === null) {
        Alert.alert("Error", "Failed to complete profile. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setShowCompleteProfileModal(true);
      player.seekTo(0);
      player.play();
      await fetchAuthenticatedUser();
    } catch (error) {
      console.error("Error completing profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const screens: { stepName: string; element: ReactNode }[] = [
    {
      stepName: "Add Profile Picture",
      element: (
        <AddProfilePicture
          uploadedProfileImage={uploadedProfileImage}
          setUploadedProfileImage={setUploadedProfileImage}
        />
      ),
    },
    {
      stepName: "Add Resume",
      element: <AddResume />,
    },
    {
      stepName: "Add Title & Bio",
      element: <AddGeneralInfo detailsForm={detailsForm} setDetailsForm={setDetailsForm} />,
    },
    {
      stepName: "Upload 60 Second Intro Video (Optional but recommended)",
      element: <AddVideoIntro uploadedVideoIntro={uploadedVideoIntro} setUploadedVideoIntro={setUploadedVideoIntro} />,
    },
    {
      stepName: "",
      element: <AllSet isSubmitting={isSubmitting} handleDone={handleDone} />,
    },
  ];

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = -step * width + event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -50 && step < screens.length - 1) {
        runOnJS(setSteps)(step + 1);
        translateX.value = withSpring(-(step + 1) * width);
      } else if (event.translationX > 50 && step > 0) {
        runOnJS(setSteps)(step - 1);
        translateX.value = withSpring(-(step - 1) * width);
      } else {
        translateX.value = withSpring(-step * width);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar label="Complete Profile" />
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              flexDirection: "row",
              width: width * screens.length,
              height: "100%",
              marginTop: 20,
            },
            animatedStyle,
          ]}
        >
          {screens.map((screen, index) => (
            <View key={index} className="flex-1 items-center justify-center px-4">
              {screen.element}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
      <View className="absolute bottom-8 w-full flex-row items-center justify-center gap-2 px-6">
        {screens.map((_, idx) => (
          <View
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === step ? "w-8 bg-green-500" : idx < step ? "w-2 bg-green-300" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>
      <Modal transparent animationType="fade" visible={showCompleteProfileModal}>
        <View className="flex-1 bg-black/45 justify-center items-center">
          <View
            style={{
              width: 300,
              height: 200,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 10,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              gap: 10,
            }}
          >
            <View className="flex flex-col items-center justify-center gap-4">
              <Text className="font-quicksand-bold text-xl">Good Job!</Text>
              <Text className="font-quicksand-medium text-center">
                With your updated profile, you can now apply for jobs more easily!
              </Text>
              <TouchableOpacity
                className="apply-button w-full items-center justify-center h-14 px-6 py-2"
                onPress={() => {
                  setShowCompleteProfileModal(false);
                  router.push("/(tabs)/users/jobs");
                }}
              >
                <Text className="font-quicksand-bold text-lg">Return Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CompleteProfile;
