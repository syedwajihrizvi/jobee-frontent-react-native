import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const VerticalAnimatedList = ({ strengths }: { strengths: string[] }) => {
  return (
    <View className="w-full h-[450px] mt-2 overflow-hidden">
      <FlatList
        data={strengths}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            className="bg-green-500 dark:bg-[#1e1e1e] rounded-2xl shadow-md  mb-4 p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4, // Android shadow
            }}
          >
            <View className="flex flex-row items-start gap-2">
              <Feather name="check-circle" size={18} color="black" />
              <Text className="font-quicksand-bold text-sm">{item}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default VerticalAnimatedList;
