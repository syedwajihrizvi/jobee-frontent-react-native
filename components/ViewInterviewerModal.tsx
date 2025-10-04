import { InterviewerProfileSummary } from "@/type";
import { Entypo } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  interviewerDetails: InterviewerProfileSummary | null;
  loadingInterviewer?: boolean;
  handleClose: (value: boolean) => void;
};

const { height, width } = Dimensions.get("window");

const ViewInterviewerModal = ({ visible, handleClose, loadingInterviewer, interviewerDetails }: Props) => {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={() => handleClose(false)}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View
          style={{
            height: height * 0.6,
            width: width * 0.9,
            borderRadius: 16,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View className="flex-row justify-between items-center px-6 py-2 border-b border-gray-200">
            <Text className="font-quicksand-bold text-lg text-gray-800">Profile Viewer</Text>
            <TouchableOpacity onPress={() => handleClose(false)} className="p-2">
              <Entypo name="cross" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            {loadingInterviewer ? (
              <View className="flex-1 justify-center items-center gap-4">
                <ActivityIndicator size="large" color="#22c55e" />
                <Text className="font-quicksand-semibold text-lg text-gray-700">
                  Looking for interviewer details...
                </Text>
                <Text className="font-quicksand-regular text-sm text-gray-500 text-center px-8">
                  Fetching interviewer details. This may take a few seconds.
                </Text>
              </View>
            ) : (
              <View className="h-full">{interviewerDetails && <Text>{interviewerDetails.firstName}</Text>}</View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ViewInterviewerModal;
