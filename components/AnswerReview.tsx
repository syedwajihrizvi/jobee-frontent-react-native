import { Entypo, Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get("window");

type Props = {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  submittingAnswer: boolean;
};

const AnswerReview = ({ showModal, setShowModal, submittingAnswer }: Props) => {
  return (
    <Modal transparent animationType="fade" visible={showModal}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View
          style={{
            height: height * 0.75,
            width: width * 0.9,
            borderRadius: 20,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {submittingAnswer ? (
            <View className="flex-1 justify-center items-center gap-4">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="font-quicksand-semibold text-lg text-gray-700">Analyzing your answer...</Text>
              <Text className="font-quicksand-regular text-sm text-gray-500 text-center px-8">
                Jobee is evaluating your response and preparing personalized feedback
              </Text>
            </View>
          ) : (
            <View className="flex-1">
              <View className="flex-row justify-between items-center px-6 py-2 border-b border-gray-200">
                <Text className="font-quicksand-bold text-lg text-gray-800">Answer Analysis</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} className="p-2">
                  <Entypo name="cross" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View className="px-6 py-4">
                <View className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 items-center">
                  <Text className="font-quicksand-medium text-gray-600 mb-2">Your Score</Text>
                  <View className="flex-row items-baseline">
                    <Text className="font-quicksand-bold text-3xl text-green-600">7</Text>
                    <Text className="font-quicksand-semibold text-xl text-gray-500 ml-1">/10</Text>
                  </View>
                  <View className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <View className="bg-green-500 h-2 rounded-full" style={{ width: "70%" }} />
                  </View>
                </View>
              </View>
              <View className="px-6 flex-1">
                <Text className="font-quicksand-bold text-lg text-gray-800 mb-3">Feedback</Text>
                <View className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                  <Text className="font-quicksand-medium text-sm text-gray-700 leading-5">
                    Great structure and relevant examples! To improve, try to be more specific about measurable outcomes
                    and connect your experience more directly to the role requirements.
                  </Text>
                </View>
                <View className="bg-blue-50 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="font-quicksand-bold text-lg text-blue-800">Jobee&apos;s Model Answer</Text>
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="font-quicksand-semibold text-xs text-blue-700">REFERENCE</Text>
                    </View>
                  </View>
                  <Text className="font-quicksand-medium text-sm text-blue-700 mb-4 leading-5">
                    Listen to our AI-generated model answer to see how you can improve your response.
                  </Text>
                  <View className="flex-row items-center justify-center gap-3 bg-white rounded-xl p-4">
                    <TouchableOpacity
                      onPress={() => console.log("Play AI answer")}
                      className="flex-row items-center gap-2 bg-blue-500 px-4 py-2 rounded-full"
                    >
                      <Feather name="play" size={16} color="white" />
                      <Text className="font-quicksand-semibold text-white text-sm">Play Model Answer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View className="px-6 py-4 border-t border-gray-200">
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => setShowModal(false)} className="flex-1 bg-green-500 py-3 rounded-xl">
                    <Text className="font-quicksand-semibold text-white text-center">Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AnswerReview;
