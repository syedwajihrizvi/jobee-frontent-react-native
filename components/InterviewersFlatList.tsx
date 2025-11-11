import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import RenderBusinessProfileImage from "./RenderBusinessProfileImage";

type Props = {
  interviewers: { name: string; email: string; title: string; profileImageUrl: string }[];
  otherInterviewers: { name: string; email: string; title: string; profileImageUrl: string }[];
  onInterviewerSelect: (email: string, firstName: string, lastName: string) => void;
};
const InterviewersFlatList = ({ interviewers, otherInterviewers, onInterviewerSelect }: Props) => {
  return (
    <FlatList
      data={[...(interviewers ?? []), ...(otherInterviewers ?? [])]}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="items-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-[120px]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => onInterviewerSelect(item.email, item.name, item.profileImageUrl)}
          activeOpacity={0.7}
        >
          <RenderBusinessProfileImage
            profileImageUrl={item.profileImageUrl}
            profileImageSize={16}
            fullName={item.name}
            fontSize={16}
          />
          <Text className="font-quicksand-semibold text-sm text-gray-900 text-center mt-1">{item.name}</Text>
          <Text
            className="font-quicksand-medium text-xs text-gray-500 text-center mt-1"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title || "Interviewer"}
          </Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View className="w-3" />}
    />
  );
};

export default InterviewersFlatList;
