import BackBar from "@/components/BackBar";
import { useInterviewPrep } from "@/lib/services/useInterviewPrep";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { ReactNode, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PrepForInterview = () => {
  const { id: interviewId } = useLocalSearchParams();
  const { data, isLoading } = useInterviewPrep({
    interviewId: Number(interviewId),
  });
  const viewRef = useRef<KeyboardAvoidingView | null>(null);
  const width = Dimensions.get("window").width;
  const [step, setSteps] = useState(0);
  const translateX = useSharedValue(0);

  const screens: { stepName: string; element: ReactNode }[] = [
    {
      stepName: "Let's get you prepared for your interview!",
      element: (
        <View key={1} className="w-full h-full items-center justify-center">
          <Text className="font-quicksand-semibold text-lg mb-4 text-center">
            Jobee will help you prepare for your interview at Company XYZ.
          </Text>
        </View>
      ),
    },
    {
      stepName: "First, let's assess why you are a great fit for this role",
      element: (
        <View key={2} className="w-full h-full items-center justify-center">
          <Text className="font-quicksand-semibold text-lg mb-4 text-center">
            You have {data?.strengths.length} strengths that make you a great
            fit for this role. These were determined based on your profile and
            the job description along with the company description.
          </Text>
        </View>
      ),
    },
    {
      stepName: "Here are your strenghts",
      element: (
        <View key={2} className="w-full h-full items-center justify-center">
          {data?.strengths.map((str, index) => (
            <View key={index} className="flex flex-row items-start mb-2">
              <Feather
                name="check-square"
                size={12}
                color="green"
                className="mt-1 mr-2"
              />
              <Text className="font-quicksand-semibold text-md flex-shrink">
                {str}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      stepName:
        "Now, lets assess some your weaknesses and why you make not get the job.",
      element: (
        <View key={2} className="w-full h-full items-center justify-center">
          <Text className="font-quicksand-semibold text-lg mb-4 text-center">
            Do not worry or get demotivated; everyone has weaknesses. The
            important thing is to be aware of them and work on improving them.
            Is it the best way to achieve your goals.
          </Text>
        </View>
      ),
    },
    {
      stepName: "Here are some weaknesses",
      element: (
        <View key={2} className="w-full h-full items-center justify-center">
          {data?.weaknesses.map((weakness, index) => (
            <View key={index} className="flex flex-row items-start mb-2">
              <Feather
                name="check-square"
                size={12}
                color="green"
                className="mt-1 mr-2"
              />
              <Text className="font-quicksand-semibold text-md flex-shrink">
                {weakness}
              </Text>
            </View>
          ))}
        </View>
      ),
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
      <BackBar label="Interview Preparation" />
      <KeyboardAvoidingView
        style={{ flex: 1, position: "relative" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        ref={viewRef}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <GestureDetector gesture={panGesture}>
          <ScrollView>
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
                <View
                  key={index}
                  style={{
                    display: "flex",
                    width,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                  }}
                  className="h-full"
                >
                  <View className="flex-1 items-center justify-center px-4">
                    <Text className="font-quicksand-bold text-2xl text-center">
                      {screen.stepName}
                    </Text>
                    {screen.element}
                  </View>
                </View>
              ))}
            </Animated.View>
          </ScrollView>
        </GestureDetector>
        <View className="absolute bottom-20 w-full flex-row items-center justify-center gap-2">
          {screens.map((_, idx) => (
            <View
              key={idx}
              className={`h-2 ${idx === step ? "w-8" : "w-2"} bg-gray-500 rounded-full`}
            />
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PrepForInterview;
