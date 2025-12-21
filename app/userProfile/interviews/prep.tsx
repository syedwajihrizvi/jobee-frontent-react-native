import Animated, {
  configureReanimatedLogger,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import BackBar from "@/components/BackBar";
import AnalyzeCandidate from "@/components/InterviewPrep/AnalyzeCandidate";
import Calendar from "@/components/InterviewPrep/Calendar";
import Conclusion from "@/components/InterviewPrep/Conclusion";
import Conducted from "@/components/InterviewPrep/Conducted";
import Details from "@/components/InterviewPrep/Details";
import Interviewers from "@/components/InterviewPrep/Interviewers";
import InterviewersDetails from "@/components/InterviewPrep/InterviewersDetails";
import Introduction from "@/components/InterviewPrep/Introduction";
import Question from "@/components/InterviewPrep/Question";
import QuestionsIntro from "@/components/InterviewPrep/QuestionsIntro";
import ResourcesList from "@/components/InterviewPrep/ResoucesList";
import Resources from "@/components/InterviewPrep/Resources";
import Strengths from "@/components/InterviewPrep/Strengths";
import TipsFromCompany from "@/components/InterviewPrep/TipsFromCompany";
import Weaknesses from "@/components/InterviewPrep/Weaknesses";
import { useInterviewPrep } from "@/lib/services/useInterviewPrep";
import { useInterviewDetails } from "@/lib/services/useProfile";
import { useLocalSearchParams } from "expo-router";
import React, { ReactNode, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

configureReanimatedLogger({
  strict: false, // Disable strict mode
});

const PrepForInterview = () => {
  const { id: interviewId } = useLocalSearchParams();

  const { data: interviewPrep, isLoading } = useInterviewPrep({
    interviewId: Number(interviewId),
  });
  const { data: interviewDetails } = useInterviewDetails(Number(interviewId));
  const viewRef = useRef<KeyboardAvoidingView | null>(null);
  const width = Dimensions.get("window").width;
  const [step, setSteps] = useState(0);
  const translateX = useSharedValue(0);

  const screens: ReactNode[] = [
    <Introduction key={1} interviewDetails={interviewDetails} />,
    <Details key={2} interviewDetails={interviewDetails} />,
    <Calendar
      key={3}
      startTime={interviewDetails?.startTime || ""}
      timezone={interviewDetails?.timezone || ""}
      interviewDate={interviewDetails?.interviewDate || ""}
      companyName={interviewDetails?.companyName || ""}
      interviewId={Number(interviewId)}
      remindersSet={interviewPrep?.helpMeRemember || false}
    />,
    <Conducted key={4} interviewDetails={interviewDetails} />,
    <Interviewers key={5} />,
    <InterviewersDetails key={6} interviewDetails={interviewDetails} />,
    <TipsFromCompany key={7} interviewPrep={interviewPrep!} />,
    <AnalyzeCandidate key={8} />,
    <Strengths key={9} interviewPrep={interviewPrep!} />,
    <Weaknesses key={10} interviewPrep={interviewPrep!} />,
    <Resources key={11} />,
    <ResourcesList key={12} interviewPrep={interviewPrep!} interviewId={Number(interviewId)} />,
    <QuestionsIntro key={13} />,
    <Question key={14} interviewId={Number(interviewId)} interviewPrep={interviewPrep!} />,
    <Conclusion key={15} interviewDetails={interviewDetails} />,
  ];

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = -step * width + event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -50 && step < screens.length - 1) {
        const nextStep = step + 1;
        translateX.value = withSpring(-nextStep * width);
        runOnJS(setSteps)(nextStep); // Use runOnJS here
      } else if (event.translationX > 50 && step > 0) {
        const prevStep = step - 1;
        translateX.value = withSpring(-prevStep * width);
        runOnJS(setSteps)(prevStep); // Use runOnJS here
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
        {isLoading ? (
          <ActivityIndicator size="large" color="#00ff00" className="mt-10" />
        ) : (
          <>
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  {
                    flexDirection: "row",
                    width: width * screens.length,
                    height: "96%",
                    marginTop: 5,
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
                    <View className="flex-1 items-center justify-center px-4">{screen}</View>
                  </View>
                ))}
              </Animated.View>
            </GestureDetector>
            <View className="absolute bottom-5 w-full flex-row items-center justify-center gap-2">
              {screens.map((_, idx) => (
                <View
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step ? "w-8 bg-emerald-500" : idx < step ? "w-2 bg-emerald-300" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PrepForInterview;
