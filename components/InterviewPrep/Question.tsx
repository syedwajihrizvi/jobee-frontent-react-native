import { useInterviewQuestions } from "@/lib/services/useInterviewQuestions";
import { InterviewPreparation, InterviewPrepQuestion } from "@/type";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import PrepQuestion from "../PrepQuestion";

const Question = ({ interviewId, interviewPrep }: { interviewId: number; interviewPrep: InterviewPreparation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { data: fetchedQuestions, isLoading } = useInterviewQuestions({ interviewId });
  const [interviewQuestions, setInterviewQuestions] = useState(fetchedQuestions);

  useEffect(() => {
    if (!isLoading && fetchedQuestions) {
      setInterviewQuestions(fetchedQuestions);
    }
  }, [isLoading, fetchedQuestions]);

  const handleQuestionUpdate = (question: InterviewPrepQuestion) => {
    // Find the index of the question to update
    const index = interviewQuestions?.findIndex((q) => q.id === question.id);
    // Replace it. It is guaranteed to be found
    let updatedQuestions = [...(interviewQuestions || [])];
    updatedQuestions[index!] = question;
    setInterviewQuestions(updatedQuestions);
  };

  return (
    <View key={16} className="w-full h-full px-4 pt-8">
      <Text className="font-quicksand-bold text-md text-center mb-8">
        Try to answer it after hearing it just once by clicking the{" "}
        {<Feather name="volume-2" size={16} color="#21c55e" />} icon. If you need to view the question, you can but in
        an actual interview, your listening skills matter.
      </Text>
      <View>
        {isLoading || !interviewQuestions ? (
          <View className="flex-1 justify-center items-center gap-4">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="font-quicksand-semibold text-lg text-gray-700">Fetching Questions...</Text>
            <Text className="font-quicksand-regular text-sm text-gray-500 text-center px-8">
              Generating 20 Practice Questions for you.
            </Text>
          </View>
        ) : (
          <View className="items-center justify-center h-[400px]">
            <Text className="font-quicksand-bold text-2xl text-center mb-4">
              Question {currentQuestionIndex + 1} of {fetchedQuestions?.length}
            </Text>
            <View
              className="bg-white rounded-2xl shadow-lg p-6 mb-4 h-[180px] items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text className="font-quicksand-semibold text-lg text-gray-800 text-center leading-6">
                {interviewQuestions && interviewQuestions![currentQuestionIndex]?.question}
              </Text>
            </View>
            <View className="flex-row items-center justify-center gap-4 mb-2">
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
                  color={currentQuestionIndex === (interviewQuestions?.length || 1) - 1 ? "gray" : "black"}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-1 justify-center">
              <PrepQuestion
                interviewId={Number(interviewId)}
                questionInfo={interviewQuestions![currentQuestionIndex]!}
                onQuestionUpdate={handleQuestionUpdate}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Question;
