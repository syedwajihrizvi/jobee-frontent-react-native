import UploadVideoIntro from "@/components/UploadVideoIntro";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  uploadedVideoIntro: ImagePicker.ImagePickerResult | null;
  setUploadedVideoIntro: React.Dispatch<React.SetStateAction<ImagePicker.ImagePickerResult | null>>;
  handleSubmit: () => void;
};

const AddVideoIntro = ({ uploadedVideoIntro, setUploadedVideoIntro, handleSubmit }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 py-8">
        <View className="items-center mb-8">
          <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-2">Add Video Introduction</Text>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-5">
            Upload your video introduction to show your personality and make a great first impression.
          </Text>
        </View>
        <UploadVideoIntro
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          uploadedVideo={uploadedVideoIntro}
          setUploadedVideo={setUploadedVideoIntro}
        />
        <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <View className="flex-row items-start gap-3">
            <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
              <Feather name="info" size={12} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="font-quicksand-bold text-blue-800 text-sm mb-1">Video Tips</Text>
              <Text className="font-quicksand-medium text-blue-700 text-xs leading-4">
                Keep it under 60 seconds, introduce yourself clearly, and highlight your key strengths.
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2 items-center justify-center mt-6">
          <TouchableOpacity
            className=" bg-emerald-500 py-4 rounded-xl items-center w-1/2"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text className="font-quicksand-bold text-white text-md">Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-emerald-500 py-4 rounded-xl items-center w-1/2"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text className="font-quicksand-bold text-emerald-600 text-md">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddVideoIntro;
