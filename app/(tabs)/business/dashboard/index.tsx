import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  return (
    <SafeAreaView>
      <TouchableOpacity
        className="mt-6 apply-button px-6 py-3 w-2/5 rounded-full flex-row items-center justify-center gap-2"
        onPress={() => router.push("/businessJobs/createJob")}
      >
        <Text className="font-quicksand-bold text-lg">Create Job</Text>
        <Entypo name="circle-with-plus" size={20} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Dashboard;
