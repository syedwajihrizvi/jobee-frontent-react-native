import { images } from "@/constants";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  interviewers: { name: string; email: string; title: string }[];
  otherInterviewers: { name: string; email: string; title: string }[];
  handleInterviewerPress: () => void;
};
const InterviewersFlatList = ({ interviewers, otherInterviewers, handleInterviewerPress }: Props) => {
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
          onPress={handleInterviewerPress}
          activeOpacity={0.7}
        >
          <View
            className="w-16 h-16 rounded-full mb-3 overflow-hidden border-2 border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Image source={{ uri: images.companyLogo }} className="w-full h-full" resizeMode="cover" />
          </View>
          <Text className="font-quicksand-bold text-base text-gray-900 text-center">{item.name}</Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View className="w-3" />}
    />
  );
};

export default InterviewersFlatList;
