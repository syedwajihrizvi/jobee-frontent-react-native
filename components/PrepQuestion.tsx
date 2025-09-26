import { generateInterviewQuestionPrepTextToSpeech } from "@/lib/interviewEndpoints";
import { Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { View } from "react-native";
import PulsatingButton from "./PulsatingButton";

const PrepQuestion = ({
  interviewId,
  questionId,
  question,
  answer,
}: {
  interviewId: number;
  questionId: number;
  question: string;
  answer: string;
}) => {
  const [pulsating, setPulsating] = useState({
    volume: false,
    mic: false,
    confirm: false,
  });

  const handleListenToQuestion = async () => {
    if (!pulsating.volume) {
      const res = await generateInterviewQuestionPrepTextToSpeech(
        interviewId,
        questionId
      );
      if (res == null) return;
      const { questionAudioUrl } = res;
      console.log("Audio URL: ", questionAudioUrl);
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
