import BackBar from "@/components/BackBar";
import { sounds } from "@/constants";
import { handleDropboxUpload, handleGoogleDriveUpload, handleOneDriveUpload, uploadResume } from "@/lib/manageUserDocs";
import { completeProfile } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import useCompleteProfileStore from "@/store/completeProfile.store";
import { CompleteProfileForm, User } from "@/type";
import { useAudioPlayer } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AddGeneralInfo from "./addGeneralInfo";
import AddProfilePicture from "./addProfilePicture";
import AddResume from "./addResume";
import AddVideoIntro from "./addVideoIntro";
import AllSet from "./allSet";

const CompleteProfile = () => {
  const { user: authUser, isLoading, setUser } = useAuthStore();
  const user = authUser as User | null;
  const width = Dimensions.get("window").width;
  const player = useAudioPlayer(sounds.popSound);

  const [uploadedProfileImage, setUploadedProfileImage] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [uploadedVideoIntro, setUploadedVideoIntro] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsForm, setDetailsForm] = useState<CompleteProfileForm>({
    title: "",
    city: "",
    country: "",
    summary: "",
    phoneNumber: "",
    company: "",
  });

  const { uploadMethod, documentTitle, uploadedDocument, documentLink, googleDriveFile, dropboxFile, oneDriveFile } =
    useCompleteProfileStore();

  const translateX = useSharedValue(0);

  const hasProfileImage = !!(user && user.profileImageUrl);
  const hasPrimaryResume = !!(user && user.primaryResume);
  const hasTitleAndBio = user?.title && user?.company && user?.city && user?.country && user?.phoneNumber;
  const hasVideoIntro = !!(user && user.videoIntroUrl);

  const goToNextStep = useCallback(() => {
    setStep((prevStep) => {
      const nextStep = prevStep + 1;
      translateX.value = withSpring(-nextStep * width, {
        damping: 100,
        stiffness: 400,
      });
      return nextStep;
    });
  }, [translateX, width]);

  const goToPreviousStep = useCallback(() => {
    setStep((prevStep) => {
      const previousStep = prevStep - 1;
      translateX.value = withSpring(-previousStep * width, {
        damping: 100,
        stiffness: 400,
      });
      return previousStep;
    });
  }, [translateX, width]);

  const handleDone = useCallback(async () => {
    if (!uploadMethod) {
      Alert.alert("Error", "Please select a document upload method.");
      return;
    }
    setIsSubmitting(true);
    const selectedDocumentType = "RESUME";

    try {
      uploadResume(
        uploadMethod,
        uploadedDocument,
        documentLink,
        googleDriveFile,
        dropboxFile,
        oneDriveFile,
        selectedDocumentType,
        documentTitle
      );

      const res = await completeProfile(uploadedProfileImage!, uploadedVideoIntro!, detailsForm);
      if (res === null) {
        Alert.alert("Error", "Failed to complete profile. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setShowCompleteProfileModal(true);
      player.seekTo(0);
      player.play();
      setUser({ ...res, profileComplete: true } as User);
    } catch (error) {
      console.error("Error completing profile:", error);
      Alert.alert("Error", "Failed to complete profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    uploadMethod,
    uploadedDocument,
    documentLink,
    documentTitle,
    uploadedProfileImage,
    uploadedVideoIntro,
    detailsForm,
    handleGoogleDriveUpload,
    handleDropboxUpload,
    handleOneDriveUpload,
    player,
    setUser,
  ]);

  // Memoized screens array
  const screens = useMemo(() => {
    const screenArray: { stepName: string; element: ReactNode }[] = [];

    if (!hasProfileImage) {
      screenArray.push({
        stepName: "Add Profile Picture",
        element: (
          <AddProfilePicture
            uploadedProfileImage={uploadedProfileImage}
            setUploadedProfileImage={setUploadedProfileImage}
            user={user as User}
          />
        ),
      });
    }

    if (!hasPrimaryResume) {
      screenArray.push({
        stepName: "Add Resume",
        element: <AddResume handleSubmit={goToNextStep} />,
      });
    }

    if (!hasTitleAndBio) {
      screenArray.push({
        stepName: "Add Title & Bio",
        element: <AddGeneralInfo detailsForm={detailsForm} setDetailsForm={setDetailsForm} user={user as User} />,
      });
    }

    if (!hasVideoIntro) {
      screenArray.push({
        stepName: "Upload 60 Second Intro Video (Optional but recommended)",
        element: (
          <AddVideoIntro
            uploadedVideoIntro={uploadedVideoIntro}
            setUploadedVideoIntro={setUploadedVideoIntro}
            handleSubmit={goToNextStep}
          />
        ),
      });
    }

    screenArray.push({
      stepName: "",
      element: <AllSet isSubmitting={isSubmitting} handleDone={handleDone} />,
    });

    return screenArray;
  }, [
    hasProfileImage,
    hasPrimaryResume,
    hasTitleAndBio,
    hasVideoIntro,
    uploadedProfileImage,
    user,
    goToNextStep,
    detailsForm,
    setDetailsForm,
    uploadedVideoIntro,
    isSubmitting,
    handleDone,
  ]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = -step * width + event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -50 && step < screens.length - 1) {
        runOnJS(goToNextStep)();
      } else if (event.translationX > 50 && step > 0) {
        runOnJS(goToPreviousStep)();
      } else {
        translateX.value = withSpring(-step * width, {
          damping: 100,
          stiffness: 400,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackBar label="Complete Profile" />

      {isLoading ? (
        <ActivityIndicator size="large" color="#10b981" className="mt-20" />
      ) : (
        <>
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
                  idx === step ? "w-8 bg-emerald-500" : idx < step ? "w-2 bg-emerald-300" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </View>
          <Modal transparent animationType="fade" visible={showCompleteProfileModal}>
            <View className="flex-1 bg-black/45 justify-center items-center">
              <View
                className="bg-white rounded-2xl p-6 mx-6 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-2xl">🎉</Text>
                </View>

                <Text className="font-quicksand-bold text-xl text-gray-900 mb-3 text-center">Profile Complete!</Text>

                <Text className="font-quicksand-medium text-gray-600 text-center leading-6 mb-6">
                  Your profile is being enhanced with AI. Start browsing jobs while we process your resume in the
                  background!
                </Text>

                <TouchableOpacity
                  className="bg-emerald-500 w-full py-4 px-4 rounded-xl items-center"
                  style={{
                    shadowColor: "#10b981",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() => {
                    setShowCompleteProfileModal(false);
                    router.push("/(tabs)/users/jobs");
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="font-quicksand-bold text-lg text-white">Browse Jobs</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

export default CompleteProfile;
