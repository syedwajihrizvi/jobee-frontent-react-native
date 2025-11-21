import CustomMultilineInput from "@/components/CustomMultilineInput";
import { CompleteProfileForm } from "@/type";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  detailsForm: CompleteProfileForm;
  setDetailsForm: React.Dispatch<React.SetStateAction<CompleteProfileForm>>;
  handleSubmit: () => void;
};

const AddProfessionalSummary = ({ detailsForm, setDetailsForm, handleSubmit }: Props) => {
  const handleSummarySubmit = () => {
    if (detailsForm.summary.trim().length === 0) {
      alert("Please enter a professional summary or choose to generate one.");
      return;
    }
    if (detailsForm.summary.length > 200) {
      alert("Professional summary cannot exceed 200 characters. Keep it concise.");
      return;
    }
    handleSubmit();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View>
        <View className="items-center mb-8 gap-2">
          <View
            className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4"
            style={{
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Feather name="user" size={28} color="#10b981" />
          </View>
          <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-2">Professional Summary</Text>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-5">
            This is often the first thing employers see. A well-crafted summary can make a strong impression.
          </Text>
          <Text className="font-quicksand-light text-sm">You can always update it later in your profile settings.</Text>
        </View>
      </View>
      <View>
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="font-quicksand-medium text-sm text-gray-600">Professional Summary</Text>
        </View>
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <View className="flex-row items-start gap-2">
            <Feather name="info" size={14} color="#3b82f6" />
            <Text className="font-quicksand-medium text-xs text-blue-700 leading-4 flex-1">
              Write a brief summary highlighting your career goals and interests.
            </Text>
          </View>
        </View>
        <CustomMultilineInput
          value={detailsForm.summary}
          numberOfLines={4}
          placeholder="e.g. Experienced software engineer with 5+ years in mobile development. Passionate about building user-friendly apps and working in collaborative environments."
          onChangeText={(text) => setDetailsForm({ ...detailsForm, summary: text })}
        />
        <View className="absolute bottom-3 right-3">
          <Text className="font-quicksand-medium text-xs text-gray-400">{detailsForm.summary.length}/200</Text>
        </View>
      </View>
      <View className="flex-1" />
      <View className="mt-8 gap-1 px-4 mb-8">
        <TouchableOpacity
          className="bg-emerald-500 rounded-xl py-4 items-center justify-center flex-row gap-2"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={handleSummarySubmit}
          activeOpacity={0.8}
        >
          <Text className="font-quicksand-bold text-white text-lg">Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddProfessionalSummary;
