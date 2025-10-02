import { sounds } from "@/constants";
import {
  generateInterviewQuestionPrepTextToSpeech,
  generateInterviewQuestionSpeechToText,
  getFeedbackForAnswer,
} from "@/lib/interviewEndpoints";
import { getS3InterviewQuestionAudioUrl, getS3InterviewQuestionAudioUrlUsingFileName } from "@/lib/s3Urls";
import { useInterviewQuestion } from "@/lib/services/useInterviewQuestions";
import { AnswerFeedback } from "@/type";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import { Directory, File, Paths } from "expo-file-system";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AnswerReview from "./AnswerReview";
import PulsatingButton from "./PulsatingButton";

const PrepQuestion = ({ interviewId, questionId }: { interviewId: number; questionId: number }) => {
  const queryClient = useQueryClient();
  const { data: questionInfo, isLoading } = useInterviewQuestion({ interviewId, questionId });
  const [pulsating, setPulsating] = useState({
    volume: false,
    mic: false,
    confirm: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [listeningToAnswer, setListeningToAnswer] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [answerPlayStartTime, setAnswerPlayStartTime] = useState(0);
  const [questionAudioUrl, setQuestionAudioUrl] = useState<string | null>();
  const [answereAudioUrl, setAnswerAudioUrl] = useState<string | null>();
  const [feedback, setFeedback] = useState<AnswerFeedback>({
    userAnswerScore: null,
    reasonForScore: "",
    aiAnswer: null,
    aiAnswerAudioUrl: "",
  });

  const progress = useSharedValue(0);
  const questionPlayer = useAudioPlayer();
  questionPlayer.volume = 1.0;
  const answerPlayer = useAudioPlayer();
  answerPlayer.volume = 1.0;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const beepSound = useAudioPlayer(sounds.beepSound);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  useEffect(() => {
    setPulsating({ volume: false, mic: false, confirm: false });
    setListeningToAnswer(false);
    setCountdown(null);
    setAnswerPlayStartTime(0);
    progress.value = 0;
    const answerSub = answerPlayer.addListener("playbackStatusUpdate", () => {
      if (answerPlayer.currentTime >= answerPlayer.duration) {
        setListeningToAnswer(false);
        setAnswerPlayStartTime(0);
        progress.value = 0;
        answerPlayer.seekTo(0);
      }
    });
    const questionSub = questionPlayer.addListener("playbackStatusUpdate", () => {
      if (questionPlayer.currentTime >= questionPlayer.duration) {
        setPulsating((prev) => ({ ...prev, volume: false }));
        questionPlayer.seekTo(0);
      }
    });
    return () => {
      answerSub.remove();
      questionSub.remove();
    };
  }, [questionId]);

  useEffect(() => {
    if (!questionInfo) return;
    const { questionAudioUrl, answerAudioUrl, aiAnswerAudioUrl, reasonForScore, aiAnswer, userAnswerScore } =
      questionInfo;
    setFeedback((prev) => ({
      ...prev,
      aiAnswerAudioUrl,
      reasonForScore,
      aiAnswer,
      userAnswerScore: userAnswerScore !== null ? Number(userAnswerScore) : null,
    }));
    if (questionAudioUrl) {
      setQuestionAudioUrl(questionAudioUrl);
      questionPlayer.replace({
        uri: getS3InterviewQuestionAudioUrlUsingFileName(`${interviewId}/${questionAudioUrl}`),
      });
    } else {
      setQuestionAudioUrl(null);
      questionPlayer.remove();
    }
    questionPlayer.seekTo(0);
    questionPlayer.pause();
    if (answerAudioUrl) {
      setAnswerAudioUrl(answerAudioUrl);
      answerPlayer.replace({
        uri: getS3InterviewQuestionAudioUrlUsingFileName(`${interviewId}/${answerAudioUrl}`),
      });
    } else {
      // Check if there's existing answer audio saved locally
      const localFile = getLocalRecordingPath(questionInfo.id.toString());
      if (localFile) {
        setAnswerAudioUrl(localFile);
        answerPlayer.replace({ uri: localFile });
      } else {
        setAnswerAudioUrl(null);
        answerPlayer.remove();
      }
      answerPlayer.seekTo(0);
      answerPlayer.pause();
    }
  }, [questionInfo, isLoading]);

  const getLocalRecordingPath = (questionId: string) => {
    const destination = new Directory(Paths.document, `interview-prep/questions/answers/audio`);
    const file = new File(destination, `${questionId}-answer.m4a`);
    if (file.exists) {
      return file.uri;
    }
    return null;
  };

  const saveRecordingLocally = async (uri: string, questionId: string) => {
    try {
      const destination = new Directory(Paths.document, `interview-prep/questions/answers/audio`);
      destination.create({ intermediates: true, idempotent: true });
      const file = new File(destination, `${questionId}-answer.m4a`);
      if (file.exists) {
        file.delete();
      }
      new File(uri).copy(file);
      console.log(file.name);
      return file.uri;
    } catch (error) {
      console.log("Error saving recording locally: ", error);
    }
  };

  const handleAnswerQuestion = async () => {
    if (!pulsating.mic) {
      const { status } = await getRecordingPermissionsAsync();
      if (status !== "granted") {
        const granted = await requestRecordingPermissionsAsync();
        console.log("Recording permission granted: ", granted);
        if (granted.status !== "granted") {
          Alert.alert("Permission Denied", "You need to allow microphone access to record your answer.");
          return;
        }
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      answerPlayer.pause();
      setListeningToAnswer(false);
      setAnswerAudioUrl(null);
      progress.value = 0;
      let counter = 3;
      beepSound.volume = 1.0;
      beepSound.seekTo(0);
      beepSound.play();
      setCountdown(counter);
      const countdownInterval = setInterval(() => {
        counter -= 1;
        if (counter === 0) {
          clearInterval(countdownInterval);
          setCountdown(null);
        } else {
          beepSound.volume = 1.0;
          beepSound.seekTo(0);
          beepSound.play();
          setCountdown(counter);
        }
      }, 1000);
      setTimeout(() => {
        recorder.record();
        setPulsating((prev) => ({ ...prev, mic: true }));
      }, 3000);
    } else {
      await recorder.stop();
      // Get the recorded uri
      const uri = recorder.uri;
      setAnswerAudioUrl(uri);
      if (questionInfo && questionInfo.id) saveRecordingLocally(uri!, questionInfo.id.toString());
      if (uri) answerPlayer.replace({ uri: uri });
      setPulsating((prev) => ({ ...prev, mic: false }));
    }
  };

  const handlePlaybackAnswer = () => {
    if (answereAudioUrl == null) return;
    if (!answerPlayer.playing) {
      answerPlayer.play();
      setListeningToAnswer(true);
      const remaining = answerPlayer.duration - answerPlayer.currentTime;
      progress.value = withTiming(100, {
        duration: remaining * 1000,
        easing: Easing.linear,
      });
      if (answerPlayStartTime === 0) setAnswerPlayStartTime(Date.now());
    } else {
      answerPlayer.pause();
      setListeningToAnswer(false);
      cancelAnimation(progress);
    }
  };

  const handleListenToQuestion = async () => {
    if (answerPlayer.playing) answerPlayer.pause();
    setListeningToAnswer(false);
    answerPlayer.seekTo(0);
    cancelAnimation(progress);
    progress.value = 0;

    if (!pulsating.volume) {
      if (!questionAudioUrl) {
        const res = await generateInterviewQuestionPrepTextToSpeech(interviewId, questionInfo?.id!);
        if (res == null) return;
        const { questionAudioUrl } = res;
        setQuestionAudioUrl(questionAudioUrl);
        questionPlayer.replace({
          uri: getS3InterviewQuestionAudioUrl(interviewId, questionInfo?.id!, "question"),
        });
      } else {
        // play from S3 url
        console.log("Using existing audio URL: ", questionAudioUrl);
      }
      setTimeout(() => {
        questionPlayer.seekTo(0);
        questionPlayer.play();
      }, 300);
    } else {
      questionPlayer.pause();
    }
    setPulsating({
      mic: false,
      confirm: false,
      volume: !pulsating.volume,
    });
  };

  const handleSubmitAnswer = () => {
    if (answereAudioUrl == null) {
      Alert.alert("No Answer Recorded", "Please record your answer first.");
      return;
    }
    Alert.alert("Submit Answer", "Are you sure you want to submit?", [
      {
        text: "Yes",
        onPress: async () => {
          const uri = answereAudioUrl;
          if (!uri) {
            Alert.alert("No Answer Recorded", "Please record your answer first.");
            return;
          }
          setSubmittingAnswer(true);
          setShowModal(true);
          try {
            const hasFeedback = feedback.userAnswerScore !== null || feedback.reasonForScore;
            let response;
            if (hasFeedback) {
              response = await getFeedbackForAnswer(interviewId, questionInfo?.id!, uri);
            } else {
              response = await generateInterviewQuestionSpeechToText(interviewId, questionInfo?.id!, uri);
            }
            if (response == null) {
              Alert.alert("Submission Failed", "There was an error submitting your answer. Please try again.");
              setShowModal(false);
              return;
            }
            const { aiAnswerAudioUrl, userAnswerScore, reasonForScore } = response;
            setFeedback((prev) => ({
              ...prev,
              aiAnswerAudioUrl,
              reasonForScore,
              userAnswerScore: parseInt(userAnswerScore!),
            }));
            queryClient.invalidateQueries({ queryKey: ["interview-question", interviewId, questionId] });
          } catch (error) {
            console.log("Error submitting answer: ", error);
            setShowModal(false);
            return;
          } finally {
            setSubmittingAnswer(false);
          }
        },
      },
      {
        text: "No",
        onPress: () => {
          console.log("Cancelled submit");
        },
      },
    ]);
  };

  const renderScoreIcon = (score: number | null) => {
    if (score === null) return <Entypo name="minus" size={16} color="gray" />;
    if (score >= 8) return <Entypo name="emoji-happy" size={16} color="green" />;
    if (score >= 5) return <Entypo name="emoji-neutral" size={16} color="orange" />;
    return <Entypo name="emoji-sad" size={16} color="red" />;
  };

  return (
    <View className="h-full items-center">
      <View className="flex flex-col items-center gap-2 ">
        {answereAudioUrl ? (
          <Text className="font-quicksand-bold text-sm text-center">
            Press <Entypo name="check" size={16} color="#21c55e" /> to submit your answer.
          </Text>
        ) : (
          <Text className="font-quicksand-bold text-sm text-center">
            Press <FontAwesome name="microphone" size={16} color="#21c55e" /> to record your answer.
          </Text>
        )}

        <View className="flex flex-row items-center justify-start gap-2 mb-4 w-full bg-green-500 rounded-full px-2 py-1">
          <TouchableOpacity onPress={handlePlaybackAnswer}>
            <Feather
              name={listeningToAnswer ? `pause-circle` : `play-circle`}
              size={24}
              color={answereAudioUrl == null ? `gray` : `black`}
              disabled={answereAudioUrl == null}
            />
          </TouchableOpacity>
          <View className="w-3/4">
            <View className="w-full rounded-full h-1 bg-white">
              <Animated.View className="bg-black h-1 rounded-full" style={animatedStyle} />
            </View>
          </View>
        </View>
      </View>
      {(feedback.userAnswerScore !== null || feedback.reasonForScore) && (
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {renderScoreIcon(feedback.userAnswerScore)}
          <Text className="font-quicksand-semibold text-sm">View Feedback</Text>
          {feedback.userAnswerScore !== null && (
            <View className="bg-white px-2 py-1 rounded-full">
              <Text className="font-quicksand-bold text-xs">{feedback.userAnswerScore}/10</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <View className="flex flex-row gap-4 items-center justify-between w-full px-4 py-2">
        <PulsatingButton pulsating={pulsating.volume} handlePress={handleListenToQuestion}>
          <Feather name="volume-2" size={20} color="black" />
        </PulsatingButton>

        <PulsatingButton pulsating={pulsating.mic} handlePress={handleAnswerQuestion} disabled={countdown !== null}>
          {countdown ? (
            <Text className="font-quicksand-bold text-xl">{countdown}</Text>
          ) : (
            <FontAwesome name="microphone" size={20} color="black" />
          )}
        </PulsatingButton>

        <PulsatingButton pulsating={pulsating.confirm} handlePress={handleSubmitAnswer} disabled={submittingAnswer}>
          <Entypo name="check" size={20} color="black" />
        </PulsatingButton>
      </View>
      {questionInfo && (
        <AnswerReview
          showModal={showModal}
          interviewId={interviewId}
          questionId={questionInfo.id}
          setShowModal={setShowModal}
          answerText={questionInfo.aiAnswer}
          submittingAnswer={submittingAnswer}
          score={feedback.userAnswerScore || null}
          feedback={feedback.reasonForScore || ""}
          answerAudioUrl={feedback.aiAnswerAudioUrl || questionInfo.aiAnswerAudioUrl}
        />
      )}
    </View>
  );
};

export default PrepQuestion;
