import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  uploadedResume: DocumentPicker.DocumentPickerResult | null;
  setUploadedResume: React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerResult | null>>;
  resumeTitle: string;
  setResumeTitle: React.Dispatch<React.SetStateAction<string>>;
};

const AddResume = ({ uploadedResume, setUploadedResume, resumeTitle, setResumeTitle }: Props) => {
  const [resumeLink, setResumeLink] = useState("");

  const handleDocumentUpload = async () => {
    try {
      const document = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (!document.canceled) {
        setUploadedResume(document);
      }
    } catch (error) {
      console.error("Error picking document: ", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    }
  };

  const handlePhotoUpload = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) {
      Alert.alert("Permission Denied", "You need to allow gallery access to upload a resume photo.");
      return;
    }

    const galleryResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (!galleryResult.canceled) {
      // Handle photo upload logic here
      console.log("Photo selected:", galleryResult);
    }
  };

  const showUploadOptions = () => {
    Alert.alert("Upload Resume", "Choose how you'd like to add your resume", [
      { text: "Upload Document", onPress: handleDocumentUpload },
      { text: "Take Photo", onPress: handlePhotoUpload },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().includes(".pdf")) return "file-text";
    if (filename.toLowerCase().includes(".doc")) return "file-text";
    return "file";
  };

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderUploadedResumeInfo = () => {
    if (uploadedResume && !uploadedResume.canceled && uploadedResume.assets && uploadedResume.assets.length > 0) {
      const file = uploadedResume.assets[0];
      return (
        <View
          className="bg-white border-2 border-green-200 rounded-2xl p-6 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="items-center">
            <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mb-4">
              <Feather name={getFileIcon(file.name || "")} size={28} color="#22c55e" />
            </View>
            <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-1" numberOfLines={2}>
              {file.name || "Unknown file"}
            </Text>
            <Text className="font-quicksand-medium text-sm text-gray-500">
              {file.size ? formatFileSize(file.size) : "Size unknown"}
            </Text>

            {/* Success indicator */}
            <View className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 mt-4">
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={14} color="#22c55e" />
                <Text className="font-quicksand-semibold text-green-700 text-xs">Resume uploaded successfully!</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAwareScrollView
        className="flex-1 px-6 py-8"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll
      >
        <View className="items-center mb-8">
          <Text className="font-quicksand-bold text-lg text-gray-800 text-center mb-2">Add Your Resume</Text>
          <Text className="font-quicksand-medium text-gray-600 text-center leading-5">
            Upload your resume to showcase your skills and experience to potential employers
          </Text>
        </View>

        {uploadedResume ? (
          renderUploadedResumeInfo()
        ) : (
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 bg-blue-100 rounded-2xl items-center justify-center mb-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Feather name="upload" size={32} color="#3b82f6" />
            </View>
            <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
              <View className="flex-row items-center gap-2">
                <Feather name="info" size={16} color="#3b82f6" />
                <Text className="font-quicksand-medium text-blue-700 text-sm">Choose from the options below</Text>
              </View>
            </View>
          </View>
        )}
        <View className="mb-6">
          <Text className="font-quicksand-medium text-sm text-gray-600 mb-2">Resume Title</Text>
          <TextInput
            placeholder="Give your resume a title (e.g. Software Engineer Resume)"
            className="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
            style={{
              fontSize: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
            value={resumeTitle}
            onChangeText={setResumeTitle}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View className="gap-4 mb-6">
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
            style={{
              shadowColor: "#22c55e",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
            onPress={showUploadOptions}
            activeOpacity={0.8}
          >
            <Feather name="upload" size={18} color="white" />
            <Text className="text-white font-quicksand-bold text-base ml-2">
              {uploadedResume ? "Change Resume" : "Upload Resume"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="font-quicksand-semibold text-gray-500 text-sm">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          <View>
            <Text className="font-quicksand-medium text-sm text-gray-600 mb-2">Resume Link (Optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 font-quicksand-medium bg-white"
              style={{
                fontSize: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              placeholder="Enter your resume link (Google Drive, Dropbox, etc.)"
              value={resumeLink}
              onChangeText={setResumeLink}
              placeholderTextColor="#9ca3af"
              keyboardType="url"
            />
          </View>
        </View>

        <View className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
          <Text className="font-quicksand-bold text-gray-800 text-sm mb-3">📄 Resume Tips:</Text>
          <View className="gap-2">
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Upload in PDF format for best compatibility
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Keep file size under 5MB for faster loading
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Ensure all text is readable and well-formatted
            </Text>
            <Text className="font-quicksand-medium text-gray-600 text-xs">
              • Include relevant keywords for your industry
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddResume;
