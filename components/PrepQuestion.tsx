import { sounds } from "@/constants";
import {
  generateInterviewQuestionPrepTextToSpeech,
  generateInterviewQuestionSpeechToText,
  getFeedbackForAnswer,
} from "@/lib/interviewEndpoints";
import { getS3InterviewQuestionAudioUrl } from "@/lib/s3Urls";
import { AnswerFeedback, InterviewPrepQuestion } from "@/type";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
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

type Props = {
  interviewId: number;
  questionInfo: InterviewPrepQuestion;
  onQuestionUpdate: (question: InterviewPrepQuestion) => void;
};

const PrepQuestion = ({ interviewId, questionInfo, onQuestionUpdate: handleFeedbackUpdate }: Props) => {
  const { id, questionAudioUrl, answerAudioUrl, aiAnswerAudioUrl, userAnswerScore, reasonForScore, aiAnswer } =
    questionInfo;
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
  const [audioUrl, setAudioUrl] = useState<string | null>(questionAudioUrl);
  const [questionAnswerAudioUrl, setQuestionAnswerAudioUrl] = useState<string | null>(answerAudioUrl);
  const [feedback, setFeedback] = useState<AnswerFeedback>({
    userAnswerScore: userAnswerScore !== null ? Number(userAnswerScore) : null,
    reasonForScore,
    aiAnswer: null,
    aiAnswerAudioUrl,
  });

  const progress = useSharedValue(0);
  const questionPlayer = useAudioPlayer({
    uri: getS3InterviewQuestionAudioUrl(interviewId, id, "question"),
  });
  questionPlayer.volume = 1.0;
  const answerPlayer = useAudioPlayer({
    uri: getS3InterviewQuestionAudioUrl(interviewId, id, "answer"),
  });
  answerPlayer.volume = 1.0;
  const aiAnswerPlayer = useAudioPlayer({
    uri: getS3InterviewQuestionAudioUrl(interviewId, id, "ai-answer"),
  });
  aiAnswerPlayer.volume = 1.0;
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
  }, [id]);

  useEffect(() => {
    const localUri = getLocalRecordingPath(id.toString());
    if (localUri) {
      setQuestionAnswerAudioUrl(localUri);
      answerPlayer.replace({ uri: localUri });
    } else {
      setQuestionAnswerAudioUrl(answerAudioUrl);
    }
  }, [id, answerAudioUrl]);

  useEffect(() => {
    setAudioUrl(questionAudioUrl);
  }, [id, questionAudioUrl]);

  useEffect(() => {
    const questionPlayerEnd = questionPlayer.addListener("playbackStatusUpdate", () => {
      if (questionPlayer.playing === false && questionPlayer.currentTime >= questionPlayer.duration) {
        setPulsating((prev) => ({ ...prev, volume: false }));
        questionPlayer.seekTo(0);
      }
    });
    return () => {
      questionPlayerEnd.remove();
    };
  }, [questionPlayer, questionPlayer.playing]);

  useEffect(() => {
    const onEnd = answerPlayer.addListener("playbackStatusUpdate", () => {
      if (answerPlayer.playing === false && answerPlayer.currentTime >= answerPlayer.duration) {
        setListeningToAnswer(false);
        setAnswerPlayStartTime(0);
        answerPlayer.seekTo(0);
        progress.value = 0;
      }
    });
    return () => {
      onEnd.remove();
    };
  }, [answerPlayer, answerPlayer.playing, progress]);

  useEffect(() => {
    setFeedback((prev) => ({
      ...prev,
      aiAnswerAudioUrl,
      reasonForScore,
      aiAnswer,
      userAnswerScore: userAnswerScore !== null ? Number(userAnswerScore) : null,
    }));
  }, [id, aiAnswerAudioUrl, userAnswerScore, reasonForScore, aiAnswer]);

  const getLocalRecordingPath = (questionId: string) => {
    const destination = new Directory(Paths.document, `interview-prep/questions/answers/audio`);
    const file = new File(destination, `${questionId}-answer.m4a`);
    if (file.exists) {
      return file.uri;
    }
    return null;
  };

  getLocalRecordingPath(id.toString());
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
      // start recording
      setQuestionAnswerAudioUrl(null);
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
      setQuestionAnswerAudioUrl(uri);
      saveRecordingLocally(uri!, id.toString());
      console.log("Updated local answer uri: ", uri);
      if (uri) answerPlayer.replace({ uri: uri });
      setPulsating((prev) => ({ ...prev, mic: false }));
    }
  };

  const handlePlaybackAnswer = () => {
    console.log("Playing back answer from URL: ", questionAnswerAudioUrl);
    if (questionAnswerAudioUrl == null) return;
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
    if (!pulsating.volume) {
      if (!audioUrl) {
        const res = await generateInterviewQuestionPrepTextToSpeech(interviewId, id);
        if (res == null) return;
        const { questionAudioUrl } = res;
        setAudioUrl(questionAudioUrl);
        questionPlayer.replace({
          uri: getS3InterviewQuestionAudioUrl(interviewId, id, "question"),
        });
      } else {
        // play from S3 url
        console.log("Using existing audio URL: ", audioUrl);
      }
      questionPlayer.seekTo(0);
      questionPlayer.play();
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
    if (questionAnswerAudioUrl == null) {
      Alert.alert("No Answer Recorded", "Please record your answer first.");
      return;
    }
    Alert.alert("Submit Answer", "Are you sure you want to submit?", [
      {
        text: "Yes",
        onPress: async () => {
          const uri = recorder.uri;
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
              console.log("Fetching updated feedback for existing answer");
              response = await getFeedbackForAnswer(interviewId, id, uri);
            } else {
              response = await generateInterviewQuestionSpeechToText(interviewId, id, uri);
            }
            if (response == null) {
              Alert.alert("Submission Failed", "There was an error submitting your answer. Please try again.");
              setShowModal(false);
              return;
            }
            console.log("Received STT and feedback response: ", response);
            const { aiAnswerAudioUrl, userAnswerScore, reasonForScore } = response;
            // Save the question locally w/o refetching
            handleFeedbackUpdate(response);
            setFeedback((prev) => ({
              ...prev,
              aiAnswerAudioUrl,
              reasonForScore,
              userAnswerScore: parseInt(userAnswerScore!),
            }));
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
      <View className="flex flex-col items-center gap-4 ">
        {questionAnswerAudioUrl ? (
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
              color={questionAnswerAudioUrl == null ? `gray` : `black`}
              disabled={questionAnswerAudioUrl == null}
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
      <AnswerReview
        showModal={showModal}
        interviewId={interviewId}
        questionId={id}
        setShowModal={setShowModal}
        answerText={aiAnswer}
        submittingAnswer={submittingAnswer}
        score={feedback.userAnswerScore || null}
        feedback={feedback.reasonForScore || ""}
        answerAudioUrl={feedback.aiAnswerAudioUrl || aiAnswerAudioUrl}
      />
    </View>
  );
};

export default PrepQuestion;
