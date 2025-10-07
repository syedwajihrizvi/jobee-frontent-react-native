import BackBar from "@/components/BackBar";
import { sounds } from "@/constants";
import { completeProfile } from "@/lib/updateUserProfile";
import useAuthStore from "@/store/auth.store";
import { CompleteProfileForm } from "@/type";
import { useAudioPlayer } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
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
  const [uploadedResume, setUploadedResume] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [uploadedVideoIntro, setUploadedVideoIntro] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
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

  const handleDone = async () => {
    setIsSubmitting(true);
    try {
      const res = await completeProfile(
        uploadedResume!,
        uploadedProfileImage!,
        uploadedVideoIntro!,
        detailsForm,
        resumeTitle
      );
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
      element: (
        <AddResume
          uploadedResume={uploadedResume}
          setUploadedResume={setUploadedResume}
          resumeTitle={resumeTitle}
          setResumeTitle={setResumeTitle}
        />
      ),
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
