import { Project } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ProfileProjectCard = ({ project }: { project: Project }) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full relative">
      <View className="w-full flex-row items-start justify-between">
        <Text className="font-quicksand-semibold text-md w-2/3">
          {project.name}
        </Text>
        <Text className="font-quicksand-semibold text-sm">
          {project.yearCompleted}
        </Text>
      </View>
      <Text className="font-quicksand-semibold text-sm">
        {project.description}
      </Text>
      <TouchableOpacity
        className="absolute -top-2 -right-2 rounded-full p-1"
        onPress={() => console.log("Edit Project")}
      >
        <Feather name="edit" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileProjectCard;
