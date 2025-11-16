import { Tag } from "@/type";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const JobTags = ({ tags }: { tags: Tag[] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 4 }}>
      {tags.slice(0, 4).map((tag, index) => (
        <View key={index} className="bg-blue-50 px-2 py-1 rounded-md">
          <Text className="font-quicksand-medium text-xs text-blue-700">{tag.name}</Text>
        </View>
      ))}
      {tags.length > 4 && (
        <View className="bg-gray-100 px-2 py-1 rounded-md">
          <Text className="font-quicksand-medium text-xs text-gray-600">+{tags.length - 4}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default JobTags;
