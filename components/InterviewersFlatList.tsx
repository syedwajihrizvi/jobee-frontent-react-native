import { getS3BusinessProfileImage } from "@/lib/s3Urls";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

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
          <View
            className="w-16 h-16 rounded-full mb-3 overflow-hidden items-center justify-center border-2 border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {item.profileImageUrl ? (
              <Image
                source={{ uri: getS3BusinessProfileImage(item.profileImageUrl) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded-full items-center justify-center">
                <Feather name="user" size={30} color="black" />
              </View>
            )}
          </View>
          <Text className="font-quicksand-bold text-base text-gray-900 text-center">{item.name}</Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View className="w-3" />}
    />
  );
};

export default InterviewersFlatList;
