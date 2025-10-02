import { InterviewPreparation } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import PrepQuestion from "../PrepQuestion";

const Question = ({ interviewId, interviewPrep }: { interviewId: number; interviewPrep: InterviewPreparation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { question } = interviewPrep?.questions[currentQuestionIndex] || {
    question: "",
    answer: "",
  };
  return (
    <View key={16} className="w-full h-full px-4 pt-8">
      <Text className="font-quicksand-bold text-md text-center mb-8">
        Try to answer it after hearing it just once by clicking the{" "}
        {<Feather name="volume-2" size={16} color="#21c55e" />} icon. If you need to view the question, you can but in
        an actual interview, your listening skills matter.
      </Text>
      <View>
        <Text className="font-quicksand-bold text-2xl text-center mb-4">
          Question {currentQuestionIndex + 1} of {interviewPrep?.questions.length}
        </Text>
        <View className="bg-green-500 dark:bg-[#1e1e1e] rounded-2xl shadow-md p-4 mb-4 h-[150px] items-center justify-center">
          <Text className="font-quicksand-semibold text-lg text-center">{question}</Text>
        </View>
        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity
            disabled={currentQuestionIndex === 0}
            onPress={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
          >
            <Feather name="arrow-left-circle" size={24} color={currentQuestionIndex === 0 ? "gray" : "black"} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={currentQuestionIndex === (interviewPrep?.questions.length || 1) - 1}
            onPress={() =>
              setCurrentQuestionIndex((prev) => Math.min(prev + 1, (interviewPrep?.questions.length || 1) - 1))
            }
          >
            <Feather
              name="arrow-right-circle"
              size={24}
              color={currentQuestionIndex === (interviewPrep?.questions.length || 1) - 1 ? "gray" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row items-center justify-between mb-4 px-2"></View>
      <View className="flex-1 justify-center">
        <PrepQuestion
          interviewId={Number(interviewId)}
          questionId={interviewPrep?.questions[currentQuestionIndex]!.id}
        />
      </View>
    </View>
  );
};

export default Question;
