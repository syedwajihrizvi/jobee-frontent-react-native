import { Experience } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileExperienceCard = ({
  experience,
  onEditExperience,
}: {
  experience: Experience;
  onEditExperience: () => void;
}) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full relative">
      <View className="w-full flex-row items-start justify-between">
        <Text className="font-quicksand-semibold text-md w-2/3">
          {experience.title}
        </Text>
        <Text className="font-quicksand-semibold text-sm">
          {experience.from} -{" "}
          {experience.currentlyWorking ? "Present" : experience.to}
        </Text>
      </View>
      <Text className="font-quicksand-semibold text-sm">
        {experience.company}
      </Text>
      <Text className="font-quicksand-semibold text-sm">
        {experience.description}
      </Text>
      <TouchableOpacity
        className="absolute -top-2 -right-2 rounded-full p-1"
        onPress={onEditExperience}
      >
        <Feather name="edit" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileExperienceCard;
