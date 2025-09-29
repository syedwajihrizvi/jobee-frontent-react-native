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
import { Alert, TouchableOpacity, View } from "react-native";
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
  const [answerPlayerProgress, setAnswerPlayerProgress] = useState(50);
  const [audioUrl, setAudioUrl] = useState<string | null>(questionAudioUrl);
  const [questionAnswerAudioUrl, setQuestionAnswerAudioUrl] = useState<
    string | null
  >(answerAudioUrl);
  const player = useAudioPlayer({
    uri: getS3InterviewQuestionAudioUrl(interviewId, id),
  });
  const answerPlayer = useAudioPlayer();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) =>
    console.log("Recording Status: ", status)
  );

  useEffect(() => {
    setPulsating({ volume: false, mic: false, confirm: false });
  }, [id]);

  useEffect(() => {
    setAudioUrl(questionAudioUrl);
  }, [questionAudioUrl]);

  useEffect(() => {
    const onEnd = answerPlayer.addListener("playbackStatusUpdate", () => {
      if (
        answerPlayer.playing === false &&
        answerPlayer.currentTime >= answerPlayer.duration
      ) {
        setListeningToAnswer(false);
        answerPlayer.seekTo(0);
      }
    });
    return () => {
      onEnd.remove();
    };
  }, [answerPlayer, answerPlayer.playing]);

  const handleAnswerQuestion = async () => {
    console.log("Handle answer question for question id: ", id);
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
      recorder.record();
      // start recording
      setPulsating((prev) => ({ ...prev, mic: true }));
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
    } else {
      answerPlayer.pause();
      setListeningToAnswer(false);
    }
  };

  useEffect(() => {
    answerPlayer.addListener("playbackStatusUpdate", (status) => {
      console.log("Answer Player Status: ", status);
    });
  }, [answerPlayer]);
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
      {questionAnswerAudioUrl && (
        <View className="flex flex-row items-center justify-center gap-4 mb-4 w-full bg-green-500 rounded-full p-2">
          <TouchableOpacity onPress={handlePlaybackAnswer}>
            <Feather
              name={listeningToAnswer ? `pause-circle` : `play-circle`}
              size={34}
              color="black"
            />
          </TouchableOpacity>
          <View className="w-3/4">
            <View className="w-full rounded-full h-3 bg-white">
              <View
                className="bg-black h-3 rounded-full"
                style={{ width: `${answerPlayerProgress}%` }}
              />
            </View>
          </View>
        </View>
      )}
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
        >
          <FontAwesome name="microphone" size={24} color="black" />
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
