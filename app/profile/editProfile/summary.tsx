import BackBar from "@/components/BackBar";
import useAuthStore from "@/store/auth.store";
import { User } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Summary = () => {
  const { user: authUser } = useAuthStore();
  const user = authUser as User | null;
  return (
    <SafeAreaView>
      <BackBar label="Education" />
      <ScrollView>
        <View className="px-6 py-6">
          <View
            className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="font-quicksand-bold text-2xl text-gray-800 mb-2">
              View and edit your professional summary
            </Text>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              Update your professional summary to reflect your current skills, experiences, and career goals. This helps
              potential employers understand your background and what you bring to the table.
            </Text>
          </View>
        </View>
        <View className="py-3 px-6">
          <View className="relative mb-2 border border-gray-200 bg-white rounded-xl p-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-quicksand-bold text-lg text-gray-800">Profile Summary</Text>
              <TouchableOpacity>
                <Feather name="edit" size={20} color="black" />
              </TouchableOpacity>
            </View>
            <Text className="font-quicksand-medium text-gray-600 leading-5">
              {user?.summary || "No summary provided."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Summary;
