import { InterviewFilter } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  filter: InterviewFilter;
};

const NoInterviews = ({ filter }: Props) => {
  switch (filter) {
    case null:
      return (
        <View className="flex-1 justify-center items-center p-6">
          <View
            className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="calendar" size={32} color="#3b82f6" />
          </View>
          <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Interviews Yet</Text>
          <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
            When you schedule interviews for this job, they will appear here.
          </Text>
        </View>
      );
    case "Interview Scheduled":
      return (
        <View className="flex-1 justify-center items-center p-6">
          <View
            className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="calendar" size={32} color="#3b82f6" />
          </View>
          <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Scheduled Interviews</Text>
          <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
            When you schedule interviews for this job, they will appear here.
          </Text>
        </View>
      );
    case "Interview Completed":
      return (
        <View className="flex-1 justify-center items-center p-6">
          <View
            className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="calendar" size={32} color="#3b82f6" />
          </View>
          <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Comleted Interviews</Text>
          <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
            You have not completed any interviews yet. Once you complete interviews, they will appear here.
          </Text>
        </View>
      );
    case "Rejected":
      return (
        <View className="flex-1 justify-center items-center p-6">
          <View
            className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="calendar" size={32} color="#3b82f6" />
          </View>
          <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">No Rejections</Text>
          <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
            When you reject a candidate after an interview, the rejection will appear here.
          </Text>
        </View>
      );
    case "Pending":
      return (
        <View className="flex-1 justify-center items-center p-6">
          <View
            className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6"
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="calendar" size={32} color="#3b82f6" />
          </View>
          <Text className="font-quicksand-bold text-2xl text-gray-900 text-center mb-3">
            No Interviews Pending Decision
          </Text>
          <Text className="font-quicksand-medium text-base text-gray-600 text-center leading-6">
            One you complete an interview, and the candidate is pending a decision, it will appear here.
          </Text>
        </View>
      );
  }
};

export default NoInterviews;
