import { generateInterviewQuestionPrepTextToSpeech } from "@/lib/interviewEndpoints";
import { getS3InterviewQuestionAudioUrl } from "@/lib/s3Urls";
import { InterviewPrepQuestion } from "@/type";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useState } from "react";
import { View } from "react-native";
import PulsatingButton from "./PulsatingButton";

const PrepQuestion = ({
  interviewId,
  questionInfo: { id, question, answer, questionAudioUrl },
}: {
  interviewId: number;
  questionInfo: InterviewPrepQuestion;
}) => {
  const [pulsating, setPulsating] = useState({
    volume: false,
    mic: false,
    confirm: false,
  });
  const player = useAudioPlayer({
    uri: getS3InterviewQuestionAudioUrl(interviewId, id),
  });
  console.log("Question Audio URL: ", questionAudioUrl);
  const handleListenToQuestion = async () => {
    if (!pulsating.volume) {
      if (!questionAudioUrl) {
        const res = await generateInterviewQuestionPrepTextToSpeech(
          interviewId,
          id
        );
        if (res == null) return;
        const { questionAudioUrl } = res;
        console.log("Audio URL: ", questionAudioUrl);
      } else {
        // play from S3 url
        console.log("Using existing audio URL: ", questionAudioUrl);
        player.volume = 1.0;
        player.seekTo(0);
        player.play();
      }
    }
    setPulsating({
      mic: false,
      confirm: false,
      volume: !pulsating.volume,
    });
  };
  return (
    <View className="flex flex-row gap-4 items-center justify-between w-full px-4 py-2">
      <PulsatingButton
        pulsating={pulsating.volume}
        handlePress={handleListenToQuestion}
      >
        <Feather name="volume-2" size={24} color="black" />
      </PulsatingButton>

      <PulsatingButton
        pulsating={pulsating.mic}
        handlePress={() =>
          setPulsating({ volume: false, confirm: false, mic: !pulsating.mic })
        }
      >
        <FontAwesome name="microphone" size={24} color="black" />
      </PulsatingButton>

      <PulsatingButton
        pulsating={pulsating.confirm}
        handlePress={() =>
          setPulsating({
            mic: false,
            volume: false,
            confirm: !pulsating.confirm,
          })
        }
      >
        <Entypo name="check" size={24} color="black" />
      </PulsatingButton>
    </View>
  );
};

export default PrepQuestion;
