import BackBar from "@/components/BackBar";
import { images, interviewPrepChecklist } from "@/constants";
import { useInterviewPrep } from "@/lib/services/useInterviewPrep";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { convertTo12Hour, renderInterviewType } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { ReactNode, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
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
  const { data: interviewPrep, isLoading: isLoadingInterviewPrep } =
    useInterviewPrep({
      interviewId: Number(interviewId),
    });
  const { data: interviewDetails, isLoading } = useInterviewDetails(
    Number(interviewId)
  );
  const viewRef = useRef<KeyboardAvoidingView | null>(null);
  const width = Dimensions.get("window").width;
  const [step, setSteps] = useState(0);
  const translateX = useSharedValue(0);

  const screens: ReactNode[] = [
    <View key={1} className="w-full h-full items-center justify-center gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Let&apos;s get you prepared for your interview!
      </Text>
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Jobee will help you prepare for your interview at Company XYZ.
      </Text>
      <View
        className="w-2/3 border border-green-500 rounded-xl p-4 bg-green-500"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10, // For Android
        }}
      >
        {interviewPrepChecklist.map((item, index) => (
          <View key={index} className="flex flex-row items-start mb-2 gap-3">
            <Text className="font-quicksand-bold text-md">{index + 1})</Text>
            <Text className="font-quicksand-semibold text-md flex-shrink">
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>,
    <View key={2} className="w-full h-full items-center justify-center gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Let&apos;s begin with the interview details. Be sure to review this
        important information.
      </Text>
    </View>,
    <View key={3} className="w-full h-full items-center justify-center gap-4">
      <Feather name="calendar" size={48} color="#22c55e" />
      <Text className="font-quicksand-bold text-2xl text-center">
        Your inteview is scheduled for {interviewDetails?.interviewDate} at{" "}
        {convertTo12Hour(interviewDetails?.startTime!)}
      </Text>
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Make sure to be ready 15 minutes before. Let&apos;s add this to your
        calendar and also set a reminder for Jobee to remind you 1 day before
        and 1 hour before the interview.
      </Text>
      <TouchableOpacity
        className="apply-button w-2/3 items-center flex-row gap-2 justify-center h-14"
        onPress={() => console.log("Add to calendar and set notificaton")}
      >
        <Text className="font-quicksand-semibold text-lg text-center">
          Mark In Calendar
        </Text>
      </TouchableOpacity>
    </View>,
    <View key={4} className="w-full h-full items-center justify-center gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Its very important to understand how the interview will be conducted. It
        could make or break your performance in the interview.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center">
        {renderInterviewType(interviewDetails?.interviewType)}
      </Text>
      <Text className="text-center">
        ***ADD IN TESTING FOR PHONE NUMBER, MEETING LINK, ADDRESS***
      </Text>
    </View>,
    <View key={5} className="w-full h-full items-center justify-center gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Now lets, see who will be interviewing you.
      </Text>
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Another important aspect is to research your interviewers. Understanding
        them is as important as understanding the job and company.
      </Text>
    </View>,
    <View key={6} className="w-full h-full items-center justify-center gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Seems you have{" "}
        {interviewDetails?.interviewers.length! +
          interviewDetails?.otherInterviewers.length!}{" "}
        interviewers. Here are their names and roles. Click on their names to
        view more information.
      </Text>
      <View className="w-full flex flex-col gap-4 mt-4 px-4">
        {interviewDetails?.interviewers.map((interviewer, index) => (
          <View
            key={index}
            className="flex flex-row items-center gap-4 bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-md"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4, // Android shadow
            }}
          >
            <Image
              source={{ uri: images.companyLogo }}
              className="w-10 h-10 rounded-full"
            />
            <View className="flex flex-col justify-between">
              <Text className="font-quicksand-semibold text-lg flex-shrink">
                {interviewer.name}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300">
                Lead Software Engineer
              </Text>
            </View>
          </View>
        ))}
        {interviewDetails?.otherInterviewers.map((interviewer, index) => (
          <View
            key={index}
            className="flex flex-row items-center gap-4 bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-md"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4, // Android shadow
            }}
          >
            <Image
              source={{ uri: images.companyLogo }}
              className="w-10 h-10 rounded-full"
            />
            <View className="flex flex-col justify-between">
              <Text className="font-quicksand-semibold text-lg flex-shrink">
                {interviewer.name}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300">
                Lead Software Engineer
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>,
    <View key={2} className="w-full h-full items-center justify-center">
      {interviewPrep?.strengths.map((str, index) => (
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
    </View>,
    <View key={2} className="w-full h-full items-center justify-center">
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Do not worry or get demotivated; everyone has weaknesses. The important
        thing is to be aware of them and work on improving them. Is it the best
        way to achieve your goals.
      </Text>
    </View>,
    <View key={2} className="w-full h-full items-center justify-center">
      {interviewPrep?.weaknesses.map((weakness, index) => (
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
    </View>,
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
                    padding: 16,
                  }}
                  className="h-full"
                >
                  <View className="flex-1 items-center justify-center px-4">
                    {screen}
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
