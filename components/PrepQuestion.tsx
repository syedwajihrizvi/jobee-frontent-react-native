import { sounds } from "@/constants";
import { generateInterviewQuestionPrepTextToSpeech } from "@/lib/interviewEndpoints";
import { getS3InterviewQuestionAudioUrl } from "@/lib/s3Urls";
import { InterviewPrepQuestion } from "@/type";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import PulsatingButton from "./PulsatingButton";

const PrepQuestion = ({
  interviewId,
  questionInfo: { id, questionAudioUrl, answerAudioUrl },
}: {
  interviewId: number;
  questionInfo: InterviewPrepQuestion;
}) => {
  const [pulsating, setPulsating] = useState({
    volume: false,
    mic: false,
    confirm: false,
  });
  const [listeningToAnswer, setListeningToAnswer] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [answerPlayStartTime, setAnswerPlayStartTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(questionAudioUrl);
  const [questionAnswerAudioUrl, setQuestionAnswerAudioUrl] = useState<
    string | null
  >(answerAudioUrl);
  const progress = useSharedValue(0);
  const player = useAudioPlayer({
    uri: getS3InterviewQuestionAudioUrl(interviewId, id),
  });
  const answerPlayer = useAudioPlayer();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const beepSound = useAudioPlayer(sounds.beepSound);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });
  useEffect(() => {
    setPulsating({ volume: false, mic: false, confirm: false });
  }, [id]);

  useEffect(() => {
    setAudioUrl(questionAudioUrl);
  }, [questionAudioUrl]);

  useEffect(() => {
    const onEnd = player.addListener("playbackStatusUpdate", () => {
      if (player.playing === false && player.currentTime >= player.duration) {
        setPulsating((prev) => ({ ...prev, volume: false }));
        player.seekTo(0);
      }
    });
    return () => {
      onEnd.remove();
    };
  }, [player, player.playing]);

  useEffect(() => {
    const onEnd = answerPlayer.addListener("playbackStatusUpdate", () => {
      if (
        answerPlayer.playing === false &&
        answerPlayer.currentTime >= answerPlayer.duration
      ) {
        setListeningToAnswer(false);
        setAnswerPlayStartTime(0);
        answerPlayer.seekTo(0);
        progress.value = 0;
      }
    });
    return () => {
      onEnd.remove();
    };
  }, [answerPlayer, answerPlayer.playing]);

  const handleAnswerQuestion = async () => {
    if (!pulsating.mic) {
      const { status } = await getRecordingPermissionsAsync();
      if (status !== "granted") {
        const granted = await requestRecordingPermissionsAsync();
        console.log("Recording permission granted: ", granted);
        if (granted.status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "You need to allow microphone access to record your answer."
          );
          return;
        }
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
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
      if (uri) answerPlayer.replace({ uri: uri });
      setPulsating((prev) => ({ ...prev, mic: false }));
    }
  };

  const handlePlaybackAnswer = () => {
    if (questionAnswerAudioUrl == null) return;
    if (!answerPlayer.playing) {
      answerPlayer.volume = 1.0;
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
      console.log(progress.value);
      cancelAnimation(progress);
    }
  };

  const handleListenToQuestion = async () => {
    console.log("Handle listen to question for question id: ", id);
    if (!pulsating.volume) {
      console.log("Playing audio for question id: ", id);
      if (!audioUrl) {
        console.log("No audio URL, generating TTS...");
        const res = await generateInterviewQuestionPrepTextToSpeech(
          interviewId,
          id
        );
        console.log("TTS generation response: ", res);
        if (res == null) return;
        const { questionAudioUrl } = res;
        setAudioUrl(questionAudioUrl);
        console.log("Generated Audio URL: ", questionAudioUrl);
        player.replace({
          uri: getS3InterviewQuestionAudioUrl(interviewId, id),
        });
      } else {
        // play from S3 url
        console.log("Using existing audio URL: ", audioUrl);
      }
      player.volume = 1.0;
      console.log(player.volume);
      player.seekTo(0);
      player.play();
    } else {
      player.pause();
    }
    setPulsating({
      mic: false,
      confirm: false,
      volume: !pulsating.volume,
    });
  };

  const handleSubmitAnswer = () => {
    if (answerAudioUrl == null) {
      Alert.alert("No Answer Recorded", "Please record your answer first.");
      return;
    }
    Alert.alert("Submit Answer", "Are you sure you want to submit?", [
      {
        text: "Yes",
        onPress: () => {},
      },
      {
        text: "No",
        onPress: () => {},
      },
    ]);
  };

  return (
    <View className="h-full items-center">
      <View className="flex flex-col items-center gap-2 ">
        {questionAnswerAudioUrl ? (
          <Text className="font-quicksand-bold text-sm text-center">
            Press <Entypo name="check" size={16} color="#21c55e" /> to submit
            your answer.
          </Text>
        ) : (
          <Text className="font-quicksand-bold text-sm text-center">
            Press <FontAwesome name="microphone" size={16} color="#21c55e" /> to
            record your answer.
          </Text>
        )}

        <View className="flex flex-row items-center justify-center gap-4 mb-4 w-full bg-green-500 rounded-full p-2">
          <TouchableOpacity onPress={handlePlaybackAnswer}>
            <Feather
              name={listeningToAnswer ? `pause-circle` : `play-circle`}
              size={34}
              color={questionAnswerAudioUrl == null ? `gray` : `black`}
              disabled={questionAnswerAudioUrl == null}
            />
          </TouchableOpacity>
          <View className="w-3/4">
            <View className="w-full rounded-full h-3 bg-white">
              <Animated.View
                className="bg-black h-3 rounded-full"
                style={animatedStyle}
              />
            </View>
          </View>
        </View>
      </View>
      <View className="flex flex-row gap-4 items-center justify-between w-full px-4 py-2">
        <PulsatingButton
          pulsating={pulsating.volume}
          handlePress={handleListenToQuestion}
        >
          <Feather name="volume-2" size={24} color="black" />
        </PulsatingButton>

        <PulsatingButton
          pulsating={pulsating.mic}
          handlePress={handleAnswerQuestion}
          disabled={countdown !== null}
        >
          {countdown ? (
            <Text className="font-quicksand-bold text-xl">{countdown}</Text>
          ) : (
            <FontAwesome name="microphone" size={24} color="black" />
          )}
        </PulsatingButton>

        <PulsatingButton
          pulsating={pulsating.confirm}
          handlePress={handleSubmitAnswer}
        >
          <Entypo name="check" size={24} color="black" />
        </PulsatingButton>
      </View>
    </View>
  );
};

export default PrepQuestion;
