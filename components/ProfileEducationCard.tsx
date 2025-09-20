import { Education } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileEducationCard = ({
  education,
  onEditEducation,
}: {
  education: Education;
  onEditEducation: () => void;
}) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full relative">
      <View className="w-full flex-row items-center justify-between">
        <Text className="font-quicksand-semibold text-md w-2/3">
          {education.institution}
        </Text>
        {education.fromYear && education.toYear && (
          <Text className="font-quicksand-semibold text-sm">
            {education.fromYear}-{education.toYear}
          </Text>
        )}
      </View>
      <Text className="font-quicksand-semibold text-sm">
        {education.degree}
      </Text>
      <TouchableOpacity
        className="absolute -top-2 -right-2 rounded-full p-1"
        onPress={onEditEducation}
      >
        <Feather name="edit" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileEducationCard;
