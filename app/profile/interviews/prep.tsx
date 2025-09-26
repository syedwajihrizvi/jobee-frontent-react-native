import BackBar from "@/components/BackBar";
import PrepQuestion from "@/components/PrepQuestion";
import VerticalAnimatedList from "@/components/VerticalAnimatedList";
import { images, interviewPrepChecklist } from "@/constants";
import { useInterviewPrep } from "@/lib/services/useInterviewPrep";
import { useInterviewDetails } from "@/lib/services/useProfile";
import {
  convertTo12Hour,
  renderInterviewType,
  renderQuestionSteps,
} from "@/lib/utils";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
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
import {
  FlatList,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PrepForInterview = () => {
  const { id: interviewId } = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const interviewers = [
    ...(interviewDetails?.interviewers || []),
    ...(interviewDetails?.otherInterviewers || []),
  ];

  const handleResourceClick = (resource: { link: string }) => {
    // Handle resource click, e.g., open link in browser
    console.log("Resource clicked:", resource.link);
  };

  const emailAllResources = () => {
    console.log("Email all resources");
  };

  const shareResources = () => {
    console.log("Share resources");
  };

  const { question, answer } = interviewPrep?.questions[
    currentQuestionIndex
  ] || { question: "", answer: "" };

  const screens: ReactNode[] = [
    <View key={1} className="w-full h-full items-center justify-start gap-4">
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
    <View key={2} className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Let&apos;s begin with the interview details. Be sure to review this
        important information.
      </Text>
      <MaterialIcons name="checklist" size={48} color="#22c55e" />
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        No matter how obvious something might be, it is always good to review
        the details.
      </Text>
    </View>,
    <View key={3} className="w-full h-full items-center justify-start gap-4">
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
    <View key={4} className="w-full h-full items-center justify-start gap-4">
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
    <View key={5} className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Now lets, see who will be interviewing you.
      </Text>
      <Ionicons name="people" size={48} color="#22c55e" />
      <Text className="font-quicksand-semibold text-lg mb-4 text-center">
        Another important aspect is to research your interviewers. Understanding
        them is as important as understanding the job and company.
      </Text>
    </View>,
    <View key={6} className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Seems you have{" "}
        {interviewDetails?.interviewers.length! +
          interviewDetails?.otherInterviewers.length!}{" "}
        interviewers. Here are their names and roles. Click on their names to
        view more information.
      </Text>
      <View className="w-full flex flex-col gap-4 mt-4 px-4">
        {interviewers.map((interviewer, index) => (
          <TouchableOpacity
            key={index}
            className="flex flex-row items-center gap-4 bg-green-500 dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-md"
            onPress={() => console.log("View Interviewer Profile")}
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
              <Text className="text-green-800 dark:text-gray-300">
                Lead Software Engineer
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>,
    <View key={7} className="w-full h-full items-center justify-start gap-4">
      <Text className="font-quicksand-bold text-2xl text-center">
        Good, now lets analyze you as a candidate.
      </Text>
      <Ionicons name="person-circle" size={48} color="#22c55e" />
      <Text className="font-quicksand-semibold text-lg text-center">
        Understanding yourself as a candidate is as important as understanding
        the job. This will help you determine what can push you ahead of other
        candidates and what areas you need to improve on.
      </Text>
    </View>,
    <View key={8} className="w-full h-full items-center justify-start">
      <Text className="font-quicksand-bold text-2xl text-center">
        Good news first. You have many strenghts that make you a great fit for
        the role.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center mt-4">
        Lets go over them one by one. Remember to try to highlight yours
        strengths in your answers. These are not just about you, but also about
        the company.
      </Text>
    </View>,
    <View key={9} className="w-full h-full items-start gap-4">
      <VerticalAnimatedList strengths={interviewPrep?.strengths || []} />
    </View>,
    <View key={10} className="w-full h-full items-center justify-start">
      <Text className="font-quicksand-bold text-2xl text-center">
        Now the bad news. There are certain areas you need to improve on.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center mt-4">
        Focus on these areas and be ready to answer questions about them. You
        will be tested during the interview on you weaknesses; best test
        yourself now.
      </Text>
    </View>,
    <View key={11} className="w-full h-full items-start gap-4">
      <VerticalAnimatedList strengths={interviewPrep?.weaknesses || []} />
    </View>,
    <View key={12} className="w-full h-full items-center justify-start">
      <Text className="font-quicksand-bold text-2xl text-center">
        Before we dive into practice questions, take some time to review the
        following resources.
      </Text>
      <Text className="font-quicksand-semibold text-lg text-center mt-4">
        These have been curated specifically for this interview to help you
        improve your interview skills and boost your confidence. I highly
        recomend going over these before moving on to practice questions.
      </Text>
    </View>,
    <View key={12} className="w-full h-full items-start gap-4 p-4">
      <View className="w-full h-[550px] mt-2 overflow-hidden flex-col gap-4">
        <Text className="font-quicksand-bold text-lg text-center">
          Check out these resources below. Simply click them to view. I can also
          email these or provide other options to share them.
        </Text>
        <FlatList
          data={interviewPrep?.resources || []}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleResourceClick(item)}
              className="bg-green-500 dark:bg-[#1e1e1e] rounded-2xl shadow-md mb-4 p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4, // Android shadow
              }}
            >
              <View className="flex flex-row items-start gap-2">
                <AntDesign name="link" size={18} color="black" />
                <View className="flex flex-col px-2">
                  <Text className="font-quicksand-bold text-md">
                    {item.title}
                  </Text>
                  <Text className="font-quicksand-bold text-sm">
                    {item.type[0].toUpperCase() + item.type.slice(1)}
                  </Text>
                  <Text className="font-quicksand-regular text-xs">
                    {item.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <View className="w-full flex-row items-center justify-center gap-4 mb-2 px-2">
          <TouchableOpacity
            className="bg-black p-2 rounded-full flex-row gap-2 px-4"
            onPress={emailAllResources}
          >
            <Feather name="mail" size={18} color="#22c55e" />
            <Text className="font-quicksand-semibold text-green-500">
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-black p-2 rounded-full flex-row gap-2 px-4"
            onPress={shareResources}
          >
            <Feather name="share" size={18} color="#22c55e" />
            <Text className="font-quicksand-semibold text-green-500">
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>,
    <View
      key={13}
      className="w-full h-full items-center flex-col gap-4 justify-center"
    >
      <Text className="font-quicksand-bold text-2xl text-center">
        It is time to practice answering questions that could come up during
        this interview.
      </Text>
      <ScrollView className="w-full max-w-sm">
        {renderQuestionSteps.map((step, index) => (
          <View
            key={index}
            className="flex-row items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
              <Text className="font-quicksand-bold text-sm text-white">
                {index + 1}
              </Text>
            </View>
            <Text className="font-quicksand-medium text-sm flex-1 leading-5 mt-0.5">
              {step}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>,
    <View key={16} className="w-full h-full px-4 pt-8">
      <Text className="font-quicksand-bold text-md text-center mb-8">
        Try to answer it after hearing it just once by clicking the{" "}
        {<Feather name="volume-2" size={16} color="#21c55e" />} icon. If you
        need to view the question, you can but in an actual interview, your
        listening skills matter.
      </Text>
      <View>
        <Text className="font-quicksand-bold text-2xl text-center mb-4">
          Question {currentQuestionIndex + 1} of{" "}
          {interviewPrep?.questions.length}
        </Text>
        <View className="bg-green-500 dark:bg-[#1e1e1e] rounded-2xl shadow-md p-4 mb-4 h-[150px] items-center justify-center">
          <Text className="font-quicksand-semibold text-lg text-center">
            {question}
          </Text>
        </View>
        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity
            disabled={currentQuestionIndex === 0}
            onPress={() =>
              setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
            }
          >
            <Feather
              name="arrow-left-circle"
              size={24}
              color={currentQuestionIndex === 0 ? "gray" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={
              currentQuestionIndex ===
              (interviewPrep?.questions.length || 1) - 1
            }
            onPress={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(prev + 1, (interviewPrep?.questions.length || 1) - 1)
              )
            }
          >
            <Feather
              name="arrow-right-circle"
              size={24}
              color={
                currentQuestionIndex ===
                (interviewPrep?.questions.length || 1) - 1
                  ? "gray"
                  : "black"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row items-center justify-between mb-4 px-2"></View>
      <View className="flex-1 justify-center">
        <PrepQuestion
          interviewId={Number(interviewId)}
          questionId={interviewPrep?.questions[currentQuestionIndex]?.id || 0}
          question={
            interviewPrep?.questions[currentQuestionIndex]?.question || ""
          }
          answer={interviewPrep?.questions[currentQuestionIndex]?.answer || ""}
        />
      </View>
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
