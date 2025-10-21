import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  editingField: string | null;
  type?: "add" | "edit" | "delete" | "uploadDocument" | "updatePrimary";
  handleConfirm: () => void;
  handleReedit: () => void;
};

const SuccessfulUpdate = ({ editingField, handleConfirm, type = "add", handleReedit }: Props) => {
  const renderMessage = () => {
    switch (type) {
      case "add":
        return `Your ${editingField?.toLowerCase()} has been successfully added and saved to your profile.`;
      case "edit":
        return `Your ${editingField?.toLowerCase()} has been successfully updated and saved to your profile.`;
      case "delete":
        return `Your ${editingField?.toLowerCase()} has been successfully deleted from your profile.`;
      case "uploadDocument":
        return `Your document has been successfully uploaded and saved to your profile.`;
      case "updatePrimary":
        return `Your primary resume has been successfully updated.`;
      default:
        return `Your ${editingField?.toLowerCase()} has been successfully updated and saved to your profile.`;
    }
  };

  const renderReeditText = () => {
    switch (type) {
      case "add":
        return `Add Again`;
      case "edit":
        return `Edit Again`;
      case "delete":
        return `Restore`;
      case "uploadDocument":
        return `Upload Again`;
      case "updatePrimary":
        return `Change Again`;
      default:
        return `Edit Again`;
    }
  };
  return (
    <View className="flex-1 items-center justify-center gap-6 px-6 pb-10">
      <View
        className="w-20 h-20 bg-green-100 rounded-full items-center justify-center"
        style={{
          shadowColor: "#22c55e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center">
          <Feather name="check" size={32} color="white" />
        </View>
      </View>

      <View className="items-center gap-2">
        <Text className="font-quicksand-bold text-xl text-gray-800 text-center">Profile Updated!</Text>
        <Text className="font-quicksand-medium text-sm text-gray-600 text-center leading-5">{renderMessage()}</Text>
      </View>

      <View className="flex-1" />

      <View className="w-full gap-3">
        <TouchableOpacity
          className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={handleConfirm}
        >
          <Feather name="check" size={18} color="white" />
          <Text className="font-quicksand-bold text-white text-base ml-2">Perfect, thanks!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
          onPress={handleReedit}
        >
          <Feather name="edit-2" size={16} color="#6b7280" />
          <Text className="font-quicksand-semibold text-gray-600 text-sm ml-2">{renderReeditText()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessfulUpdate;
